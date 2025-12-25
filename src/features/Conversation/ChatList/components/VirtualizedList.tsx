'use client';

import { type VirtualItem, type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import isEqual from 'fast-deep-equal';
import {
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import WideScreenContainer from '../../../WideScreenContainer';
import { useConversationStore, virtuaListSelectors } from '../../store';
import AutoScroll from './AutoScroll';

interface VirtualizedListProps {
  dataSource: string[];
  /**
   * Whether AI is generating (for auto-scroll)
   */
  isGenerating?: boolean;
  itemContent: (index: number, data: string) => ReactNode;
}

interface SlotRowProps {
  index: number | null;
  itemContent: (index: number, data: string) => ReactNode;
  messageId: string | null;
  slotId: number;
  vItem?: VirtualItem;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}

const useDynamicPoolSize = (opts: {
  batch?: number;
  estimateSize: number;
  scrollEl: HTMLDivElement | null;
}) => {
  const { scrollEl, estimateSize, batch = 8 } = opts;
  const [target, setTarget] = useState(0);
  const [poolSize, setPoolSize] = useState(0);
  const [overscan, setOverscan] = useState(8);

  useLayoutEffect(() => {
    if (!scrollEl) return;

    const compute = () => {
      const height = scrollEl.clientHeight || 0;
      const visibleCount = Math.max(1, Math.ceil(height / estimateSize));
      const nextOverscan = visibleCount;
      const nextTarget = Math.max(0, visibleCount * 3 + 2);
      setOverscan(nextOverscan);
      setTarget(nextTarget);
    };

    compute();

    const observer = new ResizeObserver(() => compute());
    observer.observe(scrollEl);

    return () => observer.disconnect();
  }, [scrollEl, estimateSize]);

  useEffect(() => {
    if (poolSize >= target) return;

    let raf = 0;
    const step = () => {
      setPoolSize((prev) => Math.min(target, prev + batch));
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [batch, poolSize, target]);

  useEffect(() => {
    if (poolSize > target + batch * 4) {
      setPoolSize(target);
    }
  }, [batch, poolSize, target]);

  return { overscan, poolSize, target };
};

const useSlotAssignments = (virtualItems: VirtualItem[], poolSize: number) => {
  const indexToSlot = useRef(new Map<number, number>());
  const slotToIndexRef = useRef<(number | null)[]>([]);
  const freeSlots = useRef<number[]>([]);
  const [, force] = useReducer((value: number) => value + 1, 0);

  useLayoutEffect(() => {
    if (poolSize <= 0) {
      indexToSlot.current.clear();
      slotToIndexRef.current = [];
      freeSlots.current = [];
      force();
      return;
    }

    if (slotToIndexRef.current.length !== poolSize) {
      indexToSlot.current.clear();
      slotToIndexRef.current = Array.from({ length: poolSize }, () => null);
      freeSlots.current = Array.from({ length: poolSize }, (_, i) => i).reverse();
    }

    const visible = new Set(virtualItems.map((item) => item.index));

    for (const [index, slot] of indexToSlot.current) {
      if (!visible.has(index)) {
        indexToSlot.current.delete(index);
        slotToIndexRef.current[slot] = null;
        freeSlots.current.push(slot);
      }
    }

    for (const item of virtualItems) {
      if (!indexToSlot.current.has(item.index)) {
        const slot = freeSlots.current.pop();
        if (slot === undefined) continue;
        indexToSlot.current.set(item.index, slot);
        slotToIndexRef.current[slot] = item.index;
      }
    }

    force();
  }, [poolSize, virtualItems]);

  return slotToIndexRef.current;
};

const SlotRow = memo<SlotRowProps>(
  ({ slotId, index, vItem, messageId, itemContent, virtualizer }) => {
    const lastAssignedRef = useRef<{ id: string; index: number } | null>(null);
    const active = index !== null && vItem !== null && messageId !== null;

    useLayoutEffect(() => {
      if (index === null || messageId === null) return;
      lastAssignedRef.current = { id: messageId, index };
    }, [index, messageId]);

    const stable = lastAssignedRef.current;
    const renderId = active ? messageId : (stable?.id ?? null);
    const renderIndex = active ? index : (stable?.index ?? null);

    const content =
      renderId !== null && renderIndex !== null ? itemContent(renderIndex, renderId) : null;
    const isAgentCouncil = renderId?.includes('agentCouncil') ?? false;

    return (
      <div
        data-index={active ? index : -1}
        data-slot={slotId}
        ref={active ? virtualizer.measureElement : undefined}
        style={{
          boxSizing: 'border-box',
          left: 0,
          minHeight: active ? vItem.size : 0,
          pointerEvents: active ? 'auto' : 'none',
          position: 'absolute',
          top: 0,
          transform: `translateY(${active ? vItem.start : -999_999}px)`,
          visibility: active ? 'visible' : 'hidden',
          width: '100%',
          willChange: 'transform',
        }}
      >
        {content ? (
          isAgentCouncil ? (
            <div style={{ position: 'relative', width: '100%' }}>{content}</div>
          ) : (
            <WideScreenContainer style={{ position: 'relative' }}>{content}</WideScreenContainer>
          )
        ) : null}
      </div>
    );
  },
);

/**
 * VirtualizedList for Conversation
 *
 * Based on ConversationStore data flow, no dependency on global ChatStore.
 */
const VirtualizedList = memo<VirtualizedListProps>(({ dataSource, itemContent, isGenerating }) => {
  const prevDataLengthRef = useRef(dataSource.length);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  const estimateSize = 120;
  const bottomPadding = 24;

  const atBottomThreshold = 200;

  // Store actions
  const registerVirtuaScrollMethods = useConversationStore((s) => s.registerVirtuaScrollMethods);
  const setScrollState = useConversationStore((s) => s.setScrollState);
  const resetVisibleItems = useConversationStore((s) => s.resetVisibleItems);
  const scrollToBottom = useConversationStore((s) => s.scrollToBottom);
  const atBottom = useConversationStore(virtuaListSelectors.atBottom);

  // Check if at bottom based on scroll position
  const checkAtBottom = useCallback(() => {
    if (!scrollEl) return false;
    const scrollOffset = scrollEl.scrollTop;
    const scrollSize = scrollEl.scrollHeight;
    const viewportSize = scrollEl.clientHeight;

    return scrollSize - scrollOffset - viewportSize <= atBottomThreshold;
  }, [atBottomThreshold, scrollEl]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    setScrollState({ isScrolling: true });

    // Check if at bottom
    const isAtBottom = checkAtBottom();
    setScrollState({ atBottom: isAtBottom });

    // Clear existing timer
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }

    // Set new timer for scroll end
    scrollEndTimerRef.current = setTimeout(() => {
      setScrollState({ isScrolling: false });
    }, 150);
  }, [checkAtBottom, setScrollState]);

  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    setScrollEl(node);
  }, []);

  const { poolSize } = useDynamicPoolSize({
    estimateSize,
    scrollEl,
  });

  const virtualizer = useVirtualizer({
    count: dataSource.length,
    estimateSize: () => estimateSize,
    getScrollElement: () => scrollEl,
    overscan: 1,
  });

  useLayoutEffect(() => {
    if (!scrollEl) return;
    virtualizer.measure();
  }, [scrollEl, virtualizer]);

  // Register scroll methods to store on mount
  useEffect(() => {
    if (!scrollEl) return;

    registerVirtuaScrollMethods({
      getScrollOffset: () => scrollEl.scrollTop,
      getScrollSize: () => scrollEl.scrollHeight,
      getViewportSize: () => scrollEl.clientHeight,
      scrollToIndex: (index, options) =>
        virtualizer.scrollToIndex(index, {
          align: options?.align ?? 'auto',
          behavior: options?.smooth ? 'smooth' : 'auto',
        }),
    });

    return () => {
      registerVirtuaScrollMethods(null);
    };
  }, [registerVirtuaScrollMethods, scrollEl, virtualizer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetVisibleItems();
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [resetVisibleItems]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const shouldScroll = dataSource.length > prevDataLengthRef.current;
    prevDataLengthRef.current = dataSource.length;

    if (shouldScroll) {
      const targetIndex = Math.max(0, dataSource.length - 2);
      virtualizer.scrollToIndex(targetIndex, {
        align: 'start',
        behavior: 'smooth',
      });
    }
  }, [dataSource.length, virtualizer]);

  // Scroll to bottom on initial render
  useEffect(() => {
    if (scrollEl && dataSource.length > 0) {
      virtualizer.scrollToIndex(dataSource.length - 1, { align: 'end' });
    }
  }, [dataSource.length, scrollEl, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();
  const slotToIndex = useSlotAssignments(virtualItems, poolSize);

  const vItemByIndex = useMemo(() => {
    const map = new Map<number, VirtualItem>();
    for (const item of virtualItems) {
      map.set(item.index, item);
    }
    return map;
  }, [virtualItems]);

  return (
    <>
      <div
        onScroll={handleScroll}
        ref={setScrollRef}
        style={{ height: '100%', overflowY: 'auto', paddingBottom: bottomPadding }}
      >
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {Array.from({ length: poolSize }, (_, slotId) => {
            const index = slotToIndex[slotId] ?? null;
            const vItem = index !== null ? vItemByIndex.get(index) : undefined;
            const messageId = index !== null ? dataSource[index] : null;

            return (
              <SlotRow
                index={index}
                itemContent={itemContent}
                key={slotId}
                messageId={messageId}
                slotId={slotId}
                vItem={vItem}
                virtualizer={virtualizer}
              />
            );
          })}
        </div>
      </div>
      <WideScreenContainer
        onChange={() => {
          if (!atBottom) return;
          setTimeout(() => scrollToBottom(true), 100);
        }}
        style={{
          position: 'relative',
        }}
      >
        <AutoScroll isGenerating={isGenerating} />
      </WideScreenContainer>
    </>
  );
}, isEqual);

VirtualizedList.displayName = 'ConversationVirtualizedList';

export default VirtualizedList;
