// hooks/useDebounce.ts
import { useEffect, useState } from 'react';
import { TokenInfo } from '../types/tokenTypes';


export const useDebounce = (value: string | TokenInfo, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
