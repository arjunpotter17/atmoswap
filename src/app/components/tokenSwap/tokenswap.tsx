"use client";
import React, { useState, useEffect, useRef } from "react";
import TokenInput from "../tokenInput/tokenInput";
import { SwapIcon } from "@/app/icons/swap.icon";
import { stables, TokenInfo } from "@/app/constants/tokens";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useDebounce } from "@/app/utils/debounce";
import { CogIcon } from "@/app/icons/cog.icon";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../sidebar/sidebar";
import { RouteModal } from "../routeModal/routeModal";
import { TransactionInfoBox } from "../txInfoBox/txInfoBox";
import { toggleSettingsPanel } from "@/app/utils/toggleSettingsPanel";
import { handleSwapTokens } from "@/app/utils/handleSwapTokens";
import { fetchPriceData } from "@/app/utils/fetchPrice";

const TokenSwap = (): JSX.Element => {
  type RouteSwapInfo = {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };

  type RoutePlan = {
    swapInfo: RouteSwapInfo;
    percent: number;
  };
  //states
  const [active, setActive] = useState<string | null>(null);
  const [sellingToken, setSellingToken] = useState<TokenInfo>(stables[1]);
  const [buyingToken, setBuyingToken] = useState<TokenInfo>(stables[0]);
  const [sellingAmount, setSellingAmount] = useState<string>("");
  const [buyingAmount, setBuyingAmount] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [allowFetch, setAllowFetch] = useState<boolean>(false);
  // eslint-disable-next-line
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [showRoutesModal, setShowRoutesModal] = useState<boolean>(false);
  const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isSellAmountLoading, setIsSellAmountLoading] =
    useState<boolean>(false);
  const [isBuyAmountLoading, setIsBuyAmountLoading] = useState<boolean>(false);
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false);
  const [txInfoOpen, setTxInfoOpen] = useState<boolean>(false);
  const [type, setType] = useState<string | null>(null);
  const [minimumReceived, setMinimumReceived] = useState<number | null>(null);
  const [slippage, setSlippage] = useState<number | null>(null);
  const [resetCounter, setResetCounter] = useState<boolean>(false);
  // eslint-disable-next-line
  const [quoteResponse, setQuoteResponse] = useState<any | null>(null);
  const [countdown, setCountdown] = useState(15);

  //refs
  const wrapperRef = useRef(null);

  //web3 hooks
  const wallet = useWallet();
  const { connection } = useConnection();

  // Create debounced values
  const debouncedSellingAmount = useDebounce(sellingAmount, 700);
  const debouncedBuyingAmount = useDebounce(buyingAmount, 700);
  const debouncedSellToken = useDebounce(sellingToken, 700); //these are just so that the price fetch is debounced
  const debouncedBuyToken = useDebounce(buyingToken, 700);

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
          setAllowFetch(false);
        });
      }
    } else {
      setCountdown(15);
      setResetCounter(false);
    }
  }, [countdown, resetCounter]);

  //reverse the buy and sell tokens and then fetch the price
  const handleReverse = () => {
    setAllowFetch(false);
    setIsBuyAmountLoading(true);
    setSellingAmount(buyingAmount);
    const tempToken = sellingToken;
    setSellingToken(buyingToken);
    setBuyingToken(tempToken);
    setType("buying");
    setAllowFetch(true);
  };

  //function that fetches the swap price for the token pair
  const fetchPrice = async (type: string) => {
    let res = null;
    // Call fetch functions based on which amount was changed
    if (type === "buying") {
      res = await fetchPriceData(
        sellingToken,
        buyingToken,
        debouncedSellingAmount as string,
        slippage ? slippage : 0.5,
        setIsBuyAmountLoading
      );
      if (res) {
        setBuyingAmount(res.price.toFixed(3).toString());
      }
    } else if (type === "selling") {
      res = await fetchPriceData(
        buyingToken,
        sellingToken,
        debouncedBuyingAmount as string,
        slippage ? slippage : 50,
        setIsSellAmountLoading
      );
      if (res) {
        setSellingAmount(res.price.toFixed(3).toString());
      }
    }

    if (res) {
      setRoutes(res.routes);
      setQuoteResponse(res.quote);
      setMinimumReceived(res.minReceived);
    }
  };

  //effect that fetches the price when user changes the amount/token
  useEffect(() => {
    if (allowFetch && type) {
      fetchPrice(type);
      setAllowFetch(false);
      setResetCounter(true);
      setTriggerFetch(true);
    }
  }, [
    debouncedBuyingAmount,
    debouncedSellingAmount,
    debouncedBuyToken,
    debouncedSellToken,
  ]);

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
              onClick={() =>
                toggleSettingsPanel(isSettingsOpen, setSettingsOpen)
              }
            />
            {/* Settings Panel */}
            <Sidebar
              isOpen={isSettingsOpen}
              togglePanel={() =>
                toggleSettingsPanel(isSettingsOpen, setSettingsOpen)
              }
              selectedSlippage={slippage}
              setSelectedSlippage={setSlippage}
            />
          </>
        )}
      </AnimatePresence>

      {showRoutesModal && (
        <RouteModal
          routeData={{
            inputMint: sellingToken?.address || "", // Fallback in case address is undefined
            outputMint: buyingToken?.address || "",
            routePlan: routes, // Assuming `routes` is an array of routePlan objects
          }}
          setShowRoutesModal={setShowRoutesModal}
        />
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
            onClick={() => toggleSettingsPanel(isSettingsOpen, setSettingsOpen)}
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

        {/* route info */}
        {routes?.length > 0 && (
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

        {/* swap button */}
        <button
          className="h-12 bg-gradient-to-r from-atmos-secondary-teal via-atmos-primary-green to-atmos-secondary-teal rounded-3xl text-white font-bold transition-transform duration-300 hover:scale-95"
          onClick={() => handleSwapTokens(wallet, connection, quoteResponse)}
        >
          Swap Tokens
        </button>

        {/* tx info */}
        {txInfoOpen && minimumReceived && (
          <TransactionInfoBox
            txInfoOpen={txInfoOpen}
            setTxInfoOpen={setTxInfoOpen}
            minimumReceived={minimumReceived}
          />
        )}
      </div>
    </div>
  );
};

export default TokenSwap;
