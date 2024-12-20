"use client";
import { stables } from "@/constants/tokens";
import { DropdownIcon } from "@/icons/dropdown.icon";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { InfoIcon } from "@/icons/info.icon";
import Spinner from "@components/spinner/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { TokenInfo, TokenInputProps } from "@/lib/types/tokenTypes";

export default function TokenInput({
  type,
  active,
  selectedToken,
  counterToken,
  amount,
  isLoading,
  setSelectedToken,
  setActive,
  setAmount,
  setAllowFetch,
  setRefreshType,
}: TokenInputProps) {
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const text = type === "selling" ? "You're Selling" : "You're Buying";
  const isActive = active === type;

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  //token select dorpdown
  const handleTokenSelect = (token: TokenInfo) => {
    if (token?.name === counterToken?.name) {
      toast.error("Can't select the same token as counter token");
      return;
    }
    if (setSelectedToken) {
      setSelectedToken(token);
      setRefreshType("selling");
      setAllowFetch(true);
    }
    toggleModal();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Regular expression to allow only numbers and one decimal point
    const regex = /^\d*\.?\d*$/;

    if (regex.test(value)) {
      setAmount(value);
      if (type === "selling") {
        setRefreshType("buying");
      } else {
        setRefreshType("selling");
      }
      setAllowFetch(true);
    }
  };

  const handleActivityClick = () => {
    if (selectedToken?.address) {
      let coin: string;
      switch (selectedToken.name) {
        case "SOL":
          coin = "solana";
          break;
        case "USD Coin":
          coin = "usdc";
          break;
        case "USDT":
          coin = "tether";
          break;
        default:
          coin = "solana";
          break;
      }
      router.push(`/chart/${coin}`);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("selectedToken", selectedToken?.symbol);

  return (
    <div
      className={`bg-atmos-navbar-bg flex flex-col items-between min-h-[150px] justify-center px-5 py-7 rounded-[16px] border transition-all duration-200 ease-in ${
        isActive
          ? "border-atmos-secondary-teal shadow-even"
          : "border-gray-800 shadow-none"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="text-atmos-grey-text text-xs">{text}</div>
        <span
          data-testid={`price-chart-${selectedToken?.symbol}`}
          onClick={handleActivityClick}
          className="text-atmos-grey-text text-xs cursor-pointer hover:text-atmos-secondary-teal"
        >
          Price Chart
        </span>
      </div>

      <div className="flex items-center mt-2">
        <div className="relative" ref={modalRef}>
          {" "}
          <div
            onClick={() => {
              setActive(type);
              toggleModal();
            }}
            className="bg-atmos-bg-black border-gray-800 border hover:border-atmos-primary-green text-white p-2 rounded-lg mr-4 cursor-pointer px-3 py-2 flex items-center justify-between w-40"
          >
            <div className="flex gap-x-1 items-center justify-center">
              {selectedToken?.logoURI && (
                <img
                  src={selectedToken.logoURI}
                  alt={selectedToken.name}
                  className="w-5 h-5 mr-2"
                />
              )}
              <span
                data-testid={type === "selling" ? "inputA-drop" : "inputB-drop"}
              >
                {selectedToken?.name}
              </span>
            </div>

            <span className="text-2xl">
              <DropdownIcon />
            </span>
          </div>
          {showModal && (
            <div className="absolute bg-atmos-bg-black border border-gray-800 rounded-lg p-2 mt-2 z-10 w-40">
              {stables.map((token) => (
                <div
                  key={token.name}
                  onClick={() => handleTokenSelect(token)}
                  className="hover:bg-gray-800 rounded-lg p-2 cursor-pointer flex items-center"
                >
                  {token?.logoURI && (
                    <img
                      src={token.logoURI}
                      alt={token.name}
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <span>{token.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end flex-1 min-h-[65px]">
          {isLoading ? (
            <div>
              <Spinner size={25} />{" "}
            </div>
          ) : (
            <input
              data-testid={type === "selling" ? "inputA" : "inputB"}
              value={amount}
              onClick={() => setActive(type)}
              onChange={handleAmountChange}
              type="text"
              placeholder="0.00"
              inputMode="decimal"
              className="bg-transparent outline-none ring-0 text-white text-right w-full p-2 rounded-lg font-bold text-xl "
            />
          )}
          {amount && !isLoading && (
            <div className="text-xs text-atmos-grey-text flex items-center gap-x-2 cursor-pointer">
              ${" "}
              {selectedToken?.name !== "SOL"
                ? amount
                : (parseFloat(amount) * 180).toFixed(2)}{" "}
              {selectedToken?.name === "SOL" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Value is calculated with a mock data of $180 per SOL
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
