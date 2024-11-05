"use client";
import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { usePathname, useRouter } from "next/navigation";
import { useWindowSize } from "@hooks/useWindowSize";
import { motion } from "framer-motion";
import useSWR from "swr";
import Spinner from "@components/spinner/spinner";
import { TimeFrame } from "@/lib/types/chartTypes";
import { timeConverter } from "@/lib/utils/chart/timeConverter";
import { fetcher } from "@/lib/utils/chart/fetcher";
import { timeFrameOptions } from "@/constants/chart-view";

export default function CandlestickChart(): JSX.Element {
  //hooks
  const router = useRouter();
  const width = useWindowSize()[0];
  const pathname = usePathname();

  //refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  //states
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1W");
  const [ohlc, setOhlc] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    time: string; // Add time to the state
  } | null>(null);

  const tokenAddress =
    pathname?.split("/").pop() === "usdc"
      ? "usd-coin"
      : pathname?.split("/").pop();

  //fetch ohlc data
  const {
    data: ohlcData,
    error: ohlcError,
    isLoading: isOhlcLoading,
  } = useSWR(
    `/api/fetch-ohlc?id=${tokenAddress}&date=${timeConverter(timeFrame)}`,
    fetcher
  );

  //effect sets data for the chart
  useEffect(() => {
    if (!chartContainerRef.current || !ohlcData) return;

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
      height: Math.min(450, width * 0.75),
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

    const formattedOhlcData = ohlcData?.map(
      (item: [number, number, number, number, number]) => ({
        time: item[0] / 1000,
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      })
    );

    if (formattedOhlcData) {
      candlestickSeries.setData(formattedOhlcData);
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData.size) {
        setOhlc(null);
        return;
      }

      const candlestick = param.seriesData.get(candlestickSeries);
      if (candlestick) {
        const { open, high, low, close } = candlestick as {
          open: number;
          high: number;
          low: number;
          close: number;
        };

        const time = new Date((param.time as number) * 1000).toLocaleString(); // Convert time to local string

        setOhlc({
          open: parseFloat(open.toFixed(3)),
          high: parseFloat(high.toFixed(3)),
          low: parseFloat(low.toFixed(3)),
          close: parseFloat(close.toFixed(3)),
          time,
        });
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: Math.min(450, width * 0.75),
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [width, ohlcData]);

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
            data-testid="chart-back"
            className="self-start bg-gradient-to-r from-atmos-secondary-teal via-atmos-primary-green to-atmos-secondary-teal text-atmos-navbar-bg font-bold w-full px-4 py-2 text-sm md:text-lg rounded-lg transition-transform duration-300 hover:scale-95 max-w-fit"
            onClick={() => router.push("/")}
          >
            Back
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 justify-between self-start mt-4 md:mt-0 px-10 mb-4">
        <h1 className="text-2xl text-white">
          {tokenAddress === "tether"
            ? "USDT"
            : tokenAddress
            ? `${
                tokenAddress?.charAt(0).toUpperCase() + tokenAddress?.slice(1)
              }`
            : null}{" "}
          / USD Price Chart
        </h1>
        <div className="max-w-fit flex gap-x-2">
          {timeFrameOptions.map((option) => (
            <button
              data-testid={`view-${option.value}`}
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

      <div data-testid="chart-container" className="border border-atmos-grey-text p-3 rounded-lg mx-4 min-h-[450px]">
        {ohlcData ? (
          <div ref={chartContainerRef} className="chart-container relative">
            <div
              className={`absolute top-0 left-0 z-50 flex gap-x-3 text-white p-2 mx-4 rounded-lg mb-4 w-fit min-h-12 ${
                ohlc ? "bg-gray-900" : "bg-transparent"
              }`}
            >
              {ohlc && (
                <div className="flex items-center gap-x-3">
                  <div className="text-atmos-primary-green">
                    Time: {ohlc.time}
                  </div>
                  <div>O: {ohlc.open}</div>
                  <div>H: {ohlc.high}</div>
                  <div>L: {ohlc.low}</div>
                  <div>C: {ohlc.close}</div>
                </div>
              )}
            </div>
          </div>
        ) : ohlcError ? (
          <p>Unable to load chart for this particular coin</p>
        ) : isOhlcLoading ? (
          <div className="flex flex-col gap-y-2 justify-center items-center w-full h-full">
            <Spinner size={25} />
            <p>Loading chart</p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
