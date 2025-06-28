'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import { memo, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useImageStore } from '@/store/image';
import { generationBatchSelectors } from '@/store/image/slices/generationBatch/selectors';

import { GenerationBatchItem } from './GenerationBatchItem';

const GenerationFeed = memo(() => {
  const [parent, enableAnimations] = useAutoAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevBatchesCountRef = useRef(0);

  const currentGenerationBatches = useImageStore(generationBatchSelectors.currentGenerationBatches);

  // Auto-scroll to bottom, with different behavior for initial load vs. updates
  useEffect(() => {
    const currentBatches = currentGenerationBatches || [];
    const currentBatchesCount = currentBatches.length;
    const prevBatchesCount = prevBatchesCountRef.current;

    if (currentBatchesCount === 0) {
      prevBatchesCountRef.current = 0;
      return;
    }

    if (isInitialLoadRef.current) {
      // On initial load, scroll instantly to the end.
      containerRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      isInitialLoadRef.current = false;
    } else if (currentBatchesCount > prevBatchesCount) {
      // For subsequent updates where a batch was ADDED, scroll smoothly.
      enableAnimations(false);
      // Wait for React to re-render without animations.
      const timer = setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
        // Re-enable animations for future interactions like deleting items.
        enableAnimations(true);
      }, 50); // A small delay is enough.

      return () => clearTimeout(timer);
    }

    // Always update the ref with the latest count for the next render.
    prevBatchesCountRef.current = currentBatchesCount;
  }, [currentGenerationBatches, enableAnimations]);

  if (!currentGenerationBatches || currentGenerationBatches.length === 0) {
    return null;
  }

  return (
    <Flexbox gap={16} ref={parent} width="100%">
      {currentGenerationBatches.map((batch) => (
        <GenerationBatchItem batch={batch} key={batch.id} />
      ))}
      {/* Invisible element for scroll target */}
      <div ref={containerRef} style={{ height: 1 }} />
    </Flexbox>
  );
});

GenerationFeed.displayName = 'GenerationFeed';

export default GenerationFeed;
