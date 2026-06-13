// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

export default function useDebounce(inputValue, delayTime = 300) {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    // Start a timer for 300ms
    const timerHelper = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delayTime);

    // If the user types another letter before 300ms is up, cancel the old timer!
    return () => {
      clearTimeout(timerHelper);
    };
  }, [inputValue, delayTime]); // Run this every time the user types a new letter

  return debouncedValue;
}
