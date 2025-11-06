import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

interface UseSinglePressOptions {
  resetOnBlur?: boolean;
  resetOnFocus?: boolean;
}

export const useSinglePress = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  options?: UseSinglePressOptions,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const pressedRef = useRef(false);
  const [isPressed, setIsPressed] = useState(false);
  const resetOnFocus = options?.resetOnFocus ?? true;
  const resetOnBlur = options?.resetOnBlur ?? false;

  const reset = useCallback(() => {
    pressedRef.current = false;
    setIsPressed(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (resetOnFocus) {
        reset();
      }

      if (resetOnBlur) {
        return reset;
      }

      return undefined;
    }, [reset, resetOnBlur, resetOnFocus]),
  );

  const handlePress = useCallback((...args: Args) => {
    if (pressedRef.current) return;

    pressedRef.current = true;
    setIsPressed(true);
    callbackRef.current(...args);
  }, []);

  return { handlePress, isPressed, reset } as const;
};
