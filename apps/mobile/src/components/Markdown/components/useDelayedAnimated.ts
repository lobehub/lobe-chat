import { useEffect, useState } from 'react';

/**
 * Hook to delay the animated state change
 * When animated changes from true to false, delay the update by 1 second
 * This ensures smooth transition when streaming content ends
 */
export const useDelayedAnimated = (animated?: boolean) => {
  const [delayedAnimated, setDelayedAnimated] = useState(animated);

  // Watch for changes in animated prop
  useEffect(() => {
    if (animated === undefined) return;
    // If animated changes from true to false, delay the update by 1 second
    if (animated === false && delayedAnimated === true) {
      const timer = setTimeout(() => {
        setDelayedAnimated(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // For any other changes, update immediately
      setDelayedAnimated(animated);
    }
  }, [animated, delayedAnimated]);

  return delayedAnimated;
};
