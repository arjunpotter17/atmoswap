export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  tags: string[];
  daily_volume: number;
}

export interface TokenInputProps {
  type: string;
  active: string | null;
  selectedToken?: TokenInfo;
  counterToken?: TokenInfo;
  amount?: string;
  isLoading?: boolean;
  setSelectedToken?: (token: TokenInfo) => void;
  setActive: (type: string) => void;
  setAmount: (amount: string) => void;
  setAllowFetch: (allowFetch: boolean) => void;
  setRefreshType: (type: string) => void;
}
