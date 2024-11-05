"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the context type
interface SlippageContextType {
  slippage: number;
  setSlippage: (value: number) => void;
}

// Create the context with default values
const SlippageContext = createContext<SlippageContextType | undefined>(undefined);

// Create a provider component
export const SlippageProvider = ({ children }: { children: ReactNode }) => {
  const [slippage, setSlippage] = useState<number>(0.5);

  return (
    <SlippageContext.Provider value={{ slippage, setSlippage }}>
      {children}
    </SlippageContext.Provider>
  );
};

// Custom hook to use the slippage context
export const useSlippage = () => {
  const context = useContext(SlippageContext);
  if (context === undefined) {
    throw new Error('useSlippage must be used within a SlippageProvider');
  }
  return context;
};
