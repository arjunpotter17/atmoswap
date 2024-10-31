"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from "lightweight-charts";
import { usePathname, useRouter } from "next/navigation";
import { useWindowSize } from "@/app/utils/hooks/useWindowSize";
import { motion } from "framer-motion"; // Import Framer Motion

type TimeFrame = "1H" | "24H" | "1W" | "1M" | "1Y";

interface TimeFrameOption {
  label: string;
  value: TimeFrame;
  interval: number;
}

const timeFrameOptions: TimeFrameOption[] = [
  { label: "1 Hour", value: "1H", interval: 1 },
  { label: "24 Hours", value: "24H", interval: 15 },
  { label: "1 Week", value: "1W", interval: 60 },
  { label: "1 Month", value: "1M", interval: 240 },
  { label: "1 Year", value: "1Y", interval: 1440 },
];

const mockDataForToken = {
  sol: { basePrice: 22, volatility: 0.05 },
  usdc: { basePrice: 1, volatility: 0.001 },
  usdt: { basePrice: 1, volatility: 0.001 },
};

const generateMockData = (
  token: keyof typeof mockDataForToken,
  timeFrame: TimeFrame
) => {
  const now = Math.floor(Date.now() / 1000);
  const data = [];
  const intervals = {
    "1H": { count: 60, interval: 60 },
    "24H": { count: 96, interval: 15 * 60 },
    "1W": { count: 168, interval: 60 * 60 },
    "1M": { count: 180, interval: 4 * 60 * 60 },
    "1Y": { count: 365, interval: 24 * 60 * 60 },
  };

  const { count, interval } = intervals[timeFrame];
  const { basePrice, volatility } = mockDataForToken[token];
  let lastClose = basePrice;
  const trend = Math.random() > 0.5 ? 1 : -1;

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * interval;
    const trendFactor = 1 + trend * i * 0.0001;

    const open = lastClose;
    const change = (Math.random() - 0.5) * volatility * trendFactor;
    const close = open * (1 + change);

    const highLowSpread = Math.abs(open - close) * (1 + Math.random());
    const high = Math.max(open, close) + highLowSpread;
    const low = Math.min(open, close) - highLowSpread;

    data.push({
      time: timestamp as UTCTimestamp,
      open,
      high,
      low,
      close,
    });

    lastClose = close;
  }

  return data;
};

export default function CandlestickChart() {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("24H");
  const [ohlc, setOhlc] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null); // State for OHLC values

  const width = useWindowSize()[0];

  const pathname = usePathname();
  const tokenAddress = pathname?.split("/").pop();

  const tokenMapping: Record<string, keyof typeof mockDataForToken> = {
    "sol-address": "sol",
    "usdc-address": "usdc",
    "usdt-address": "usdt",
  };

  const token = tokenMapping[tokenAddress || ""] || "sol";

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#1a1a1a" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2B2B43" },
        horzLines: { color: "#2B2B43" },
      },
      width: chartContainerRef.current.clientWidth,
      height: Math.min(600, width * 0.75),
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#2B2B43",
        rightOffset: 2,
        barSpacing: 8,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#0bd790",
      downColor: "#ff4976",
      borderVisible: false,
      wickUpColor: "#0bd790",
      wickDownColor: "#ff4976",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const initialData = generateMockData(token, timeFrame);
    candlestickSeries.setData(initialData);

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData.size) {
        setOhlc(null);
        return;
      }

      const candlestick = param.seriesData.get(candlestickSeries);
      if (candlestick) {
        const { open, high, low, close } = candlestick as { open: number; high: number; low: number; close: number };

        setOhlc({
          open: parseFloat(open.toFixed(3)),
          high: parseFloat(high.toFixed(3)),
          low: parseFloat(low.toFixed(3)),
          close: parseFloat(close.toFixed(3)),
        });
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: Math.min(600, width * 0.75),
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [token, width]);

  useEffect(() => {
    if (seriesRef.current) {
      const newData = generateMockData(token, timeFrame);
      seriesRef.current.setData(newData);
    }
  }, [timeFrame, token]);

  return (
    <motion.div
      className="bg-atmos-bg-black rounded-lg relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-0 md:px-4">
        <div className="flex flex-col md:flex-row gap-5 w-full justify-center md:justify-start md:items-center px-4">
          <button
            className="self-start bg-gradient-to-r from-atmos-secondary-teal via-atmos-primary-green to-atmos-secondary-teal text-atmos-navbar-bg font-bold w-full px-4 py-2 text-sm md:text-lg rounded-lg transition-transform duration-300 hover:scale-95 max-w-fit"
            onClick={() => router.push("/")}
          >
            Back
          </button>
          <h1 className="text-2xl text-white">Mock Price Chart</h1>
        </div>

        <div className="flex gap-2 self-start mt-4 md:mt-0 px-4">
          {timeFrameOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeFrame(option.value)}
              className={`px-2 py-1 rounded-lg transition-all duration-200 text-sm md:text-md text-nowrap ${
                timeFrame === option.value
                  ? "bg-gradient-to-r from-atmos-secondary-teal to-atmos-primary-green text-atmos-navbar-bg"
                  : "bg-atmos-navbar-bg text-white hover:bg-gray-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* OHLC Display */}

      <div className={`flex gap-x-3 text-white p-2 mx-4 rounded-lg mb-4 w-fit min-h-12 ${ohlc ? 'bg-gray-900' : 'bg-transparent'}`}>
        {ohlc && (
          <div className="flex items-center gap-x-3">
            {" "}
            <div>O: {ohlc.open}</div>
            <div>H: {ohlc.high}</div>
            <div>L: {ohlc.low}</div>
            <div>C: {ohlc.close}</div>
          </div>
        )}
      </div>

      <div className="border border-atmos-grey-text p-3 rounded-lg mx-4">
        <div ref={chartContainerRef} />
      </div>
    </motion.div>
  );
}
