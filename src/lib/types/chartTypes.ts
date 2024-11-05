
export type TimeFrame = "24H" | "1W" | "1M" | "1Y";

export interface TimeFrameOption {
  label: string;
  value: TimeFrame;
  interval: number;
}