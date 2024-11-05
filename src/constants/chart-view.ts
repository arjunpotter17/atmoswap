import { TimeFrameOption } from "@/lib/types/chartTypes";

export const timeFrameOptions: TimeFrameOption[] = [
    { label: "24 Hours", value: "24H", interval: 15 },
    { label: "1 Week", value: "1W", interval: 60 },
    { label: "1 Month", value: "1M", interval: 240 },
    { label: "1 Year", value: "1Y", interval: 1440 },
  ];