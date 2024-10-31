"use client";
import React, { useState, useEffect, useRef } from "react";
import TokenInput from "../tokenInput/tokenInput";
import { SwapIcon } from "@/app/icons/swap.icon";
import { stables, TokenInfo } from "@/app/constants/tokens";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { checkPrice } from "@/app/utils/fetchPrice";
import { useDebounce } from "@/app/utils/debounce";
import { CogIcon } from "@/app/icons/cog.icon";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../sidebar/sidebar";
import { DropdownIcon } from "@/app/icons/dropdown.icon";
import { swapTransaction } from "@/app/utils/swapTokens";
import {
  TransactionConfirmationStrategy,
  VersionedTransaction,
} from "@solana/web3.js";

const TokenSwap = () => {
  const [active, setActive] = useState<string | null>(null);
  const [sellingToken, setSellingToken] = useState<TokenInfo>(stables[1]);
  const [buyingToken, setBuyingToken] = useState<TokenInfo>(stables[0]);
  const [sellingAmount, setSellingAmount] = useState<string>("");
  const [buyingAmount, setBuyingAmount] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const [allowFetch, setAllowFetch] = useState(false);
  // eslint-disable-next-line
  const [routes, setRoutes] = useState<any[]>([]);
  const [showRoutesModal, setShowRoutesModal] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isSellAmountLoading, setIsSellAmountLoading] = useState(false);
  const [isBuyAmountLoading, setIsBuyAmountLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [txInfoOpen, setTxInfoOpen] = useState(false);
  const [type, setType] = useState<string | null>(null);
  const [minimumReceived, setMinimumReceived] = useState<number | null>(null);
  const [slippage, setSlippage] = useState<number | null>(null);
  const [resetCounter, setResetCounter] = useState(false);
  // eslint-disable-next-line
  const [quoteResponse, setQuoteResponse] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(15);
  const wrapperRef = useRef(null);
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Create debounced values
  const debouncedSellingAmount = useDebounce(sellingAmount, 500);
  const debouncedBuyingAmount = useDebounce(buyingAmount, 500);

  //clickoutside for dorpdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (target?.closest(".token-swap-container") === null) {
        setActive(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  //timer logic to fetch price every 15 seconds but reset timer if a request is made
  useEffect(() => {
    if (!resetCounter && triggerFetch) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // When countdown reaches 0,fetch new price, and reset countdown
        if (!type) return;
        fetchPrice(type).then(() => {
          setCountdown(15);
        });
      }
    } else {
      setCountdown(15);
      setResetCounter(false);
    }
  }, [countdown, resetCounter]);

  //reverse the buy and sell tokens and then fetch the price
  const handleReverse = () => {
    const tempToken = sellingToken;
    const tempAmount = sellingAmount;
    setSellingToken(buyingToken);
    setBuyingToken(tempToken);
    setSellingAmount(buyingAmount);
    setBuyingAmount(tempAmount);
    setAllowFetch(true);
    if (type) {
      fetchPrice(type);
    }
  };

  //function to swap tokens
  const handleSwapTokens = async () => {
    if (!connected || !publicKey || !signTransaction) {
      console.log(connected, publicKey, signTransaction);
      toast.error("Please connect your wallet first");
      return;
    }

    if (!quoteResponse) {
      toast.error("Please enter details to swap");
      return;
    }
    const swappingToast = toast.loading("Swapping tokens...");
    try {
      const tx = await swapTransaction(quoteResponse, publicKey.toBase58());
      const deserializedSwap = VersionedTransaction.deserialize(tx);
      const blockhash = (await connection.getLatestBlockhash()).blockhash;
      deserializedSwap.message.recentBlockhash = blockhash;
      const signedTx = await signTransaction(deserializedSwap);
      const serializedTx = signedTx.serialize();
      const signature = await connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      const latestBlockhash = await connection.getLatestBlockhash();
      const confirmationStrategy: TransactionConfirmationStrategy = {
        signature: signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      };

      const confirmation = await connection.confirmTransaction(
        confirmationStrategy,
        "processed"
      );

      if (confirmation.value.err) {
        toast.error("Transaction failed");
        return;
      }

      console.log("Signature: ", signature);
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to swap tokens");
    } finally {
      toast.dismiss(swappingToast);
    }

    console.log("Swapping tokens");
  };

  //function that fetches the swap price for the token pair
  const fetchPrice = async (type: string) => {
    const fetchBuyingPrice = async () => {
      if (
        debouncedBuyingAmount !== "" &&
        debouncedBuyingAmount !== "0" &&
        debouncedBuyingAmount !== "."
      ) {
        setIsSellAmountLoading(true);
        const data = await checkPrice(
          buyingToken,
          parseFloat(debouncedBuyingAmount),
          sellingToken,
          slippage ? slippage*100 : 50
        );
        if (data) {
          setSellingAmount(data.price.toFixed(3).toString());
          setRoutes(data.routes);
          setQuoteResponse(data.quoteResponse);
          // Calculate Minimum Received
          const calculatedMinReceived = data.price - data.price * 0.005;
          setMinimumReceived(calculatedMinReceived);
        }
        setIsSellAmountLoading(false);
      }
    };

    const fetchSellingPrice = async () => {
      if (
        debouncedSellingAmount !== "" &&
        debouncedSellingAmount !== "0" &&
        debouncedSellingAmount !== "."
      ) {
        setIsBuyAmountLoading(true);
        const data = await checkPrice(
          sellingToken,
          parseFloat(debouncedSellingAmount),
          buyingToken,
          slippage ? slippage*100 : 50
        );
        if (data) {
          setBuyingAmount(data.price.toFixed(3).toString());
          setRoutes(data.routes);
          setQuoteResponse(data.quoteResponse);
          // Calculate Minimum Received
          const calculatedMinReceived = data.price - data.price * 0.005;
          setMinimumReceived(calculatedMinReceived);
        }
        setIsBuyAmountLoading(false);
      }
    };

    // Call fetch functions based on which amount was changed
    if (type === "buying") {
      await fetchSellingPrice();
      setAllowFetch(false);
    } else if (type === "selling") {
      await fetchBuyingPrice();
      setAllowFetch(false);
    }
  };

  //effect that fetches the price when user changes the amount/token
  useEffect(() => {
    if (allowFetch && type) {
      fetchPrice(type);
      setResetCounter(true);
      setTriggerFetch(true);
    }
  }, [
    debouncedBuyingAmount,
    debouncedSellingAmount,
    buyingToken,
    sellingToken,
  ]);

  // Toggle the side settings panel
  const toggleSettingsPanel = () => {
    setSettingsOpen(!isSettingsOpen);
  };

  return (
    <div
      className="flex justify-center items-center mt-20 md:mt-[-50px] md:h-screen"
      ref={wrapperRef}
    >
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-atmos-accent-blue bg-opacity-10 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSettingsPanel}
            />
            {/* Settings Panel */}
            <Sidebar
              isOpen={isSettingsOpen}
              togglePanel={toggleSettingsPanel}
              selectedSlippage={slippage}
              setSelectedSlippage={setSlippage}
            />
          </>
        )}
      </AnimatePresence>

      {showRoutesModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-atmos-secondary-teal bg-opacity-10">
          <div className="bg-atmos-bg-black rounded-lg p-10 w-[80%] md:w-[400px]">
            <h2 className="text-lg font-bold">Order Route Plan</h2>
            <div className="flex flex-col mt-4">
              {routes.map((route, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm">{route.swapInfo.label}</span>
                  <span className="text-atmos-secondary-teal">
                    {route.percent} %
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRoutesModal(false)}
              className="mt-8 bg-atmos-primary-green py-2 px-4 rounded-lg text-atmos-bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-y-5 w-full md:w-[512px]">
        <div className="w-full flex justify-between items-center">
          <p className="text-sm text-atmos-grey-text self-end">
            Selected Slippage:{" "}
            <span className="text-atmos-secondary-teal">
              {slippage ? slippage : 0.5}%
            </span>
          </p>
          <button
            className="h-12 rounded-3xl flex items-center bg-gradient-to-r from-atmos-secondary-teal via-atmos-primary-green to-atmos-secondary-teal text-atmos-navbar-bg font-bold transition-transform duration-300 hover:scale-95 px-3 py-1  hover:rotate-45"
            onClick={toggleSettingsPanel}
          >
            <span>
              <CogIcon />
            </span>
          </button>
        </div>
        {/* You're Selling */}
        <TokenInput
          type="selling"
          active={active}
          setActive={setActive}
          selectedToken={sellingToken}
          setSelectedToken={setSellingToken}
          counterToken={buyingToken}
          setAmount={setSellingAmount}
          amount={sellingAmount}
          setAllowFetch={setAllowFetch}
          isLoading={isSellAmountLoading}
          setRefreshType={setType}
        />
        {/* Reverse Button */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleReverse}
            className="text-white text-2xl transition-transform duration-300 hover:scale-90 border rounded-[50%] hover:border-atmos-secondary-teal p-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <SwapIcon color={isHovered ? "#0dbbac" : "#fff"} />
          </button>
        </div>
        {/* You're Buying */}
        <TokenInput
          type="buying"
          active={active}
          setActive={setActive}
          selectedToken={buyingToken}
          setSelectedToken={setBuyingToken}
          counterToken={sellingToken}
          setAmount={setBuyingAmount}
          amount={buyingAmount}
          setAllowFetch={setAllowFetch}
          isLoading={isBuyAmountLoading}
          setRefreshType={setType}
        />
        {routes.length > 0 && (
          <div className="flex justify-between items-center">
            <button
              className="cursor-pointer hover:text-atmos-secondary-teal hover:border-atmos-secondary-teal text-left text-sm text-atmos-grey-text border border-atmos-grey-text w-fit rounded-lg px-2 py-1"
              onClick={() => setShowRoutesModal(true)}
            >
              View Routes:{" "}
              {routes.length > 2
                ? `${routes[0].swapInfo.label}, ${
                    routes[1].swapInfo.label
                  } + (${routes.length - 2})`
                : routes.map((route) => route.swapInfo.label).join(", ")}
            </button>
            <p className="text-xs text-atmos-grey-text">
              Refresh in{" "}
              <span className="text-atmos-primary-green">{countdown}</span>
            </p>
          </div>
        )}

        <button
          className="h-12 bg-gradient-to-r from-atmos-secondary-teal via-atmos-primary-green to-atmos-secondary-teal rounded-3xl text-white font-bold transition-transform duration-300 hover:scale-95"
          onClick={() => handleSwapTokens()}
        >
          Swap Tokens
        </button>
        {txInfoOpen && minimumReceived && (
          <div className="flex flex-col gap-y-3">
            <div
              className="flex gap-x-2 items-center cursor-pointer"
              onClick={() => setTxInfoOpen(!txInfoOpen)}
            >
              <p className="text-xs text-atmos-grey-text transition-colors duration-200 hover:text-atmos-secondary-teal">
                Transaction Info
              </p>
              <div
                className={`transform transition-transform duration-300 ${
                  txInfoOpen ? "rotate-180" : ""
                }`}
              >
                <DropdownIcon color="#7b818a" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col border border-atmos-grey-text p-4 rounded-lg text-xs text-atmos-grey-text"
            >
              <p className=" flex items-center justify-between">
                Minimum Received: <span>{minimumReceived.toFixed(3)}</span>
              </p>
              <p className=" flex items-center justify-between">
                Max Transaction Fee: <span>0.0004 (mock)</span>
              </p>
              <p className=" flex items-center justify-between">
                Price Impact: <span>0.2% (mock)</span>
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenSwap;
