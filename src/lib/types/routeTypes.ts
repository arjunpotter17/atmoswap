export type RouteSwapInfo = {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  feeMint: string;
};

export type RoutePlan = {
  swapInfo: RouteSwapInfo;
  percent: number;
};

export interface RouteModalProps {
  routeData: {
    inputMint: string;
    outputMint: string;
    routePlan: RoutePlan[];
  };
  setShowRoutesModal: React.Dispatch<React.SetStateAction<boolean>>;
}
