import { RefObject, createContext } from 'react';
import { VListHandle } from 'virtua';

export const VirtuaContext = createContext<RefObject<VListHandle | null> | null>(null);

type VirtuaRef = RefObject<VListHandle | null> | null;

let currentVirtuaRef: VirtuaRef = null;
const refListeners = new Set<() => void>();

const visibleItems = new Map<number, { bottom: number; ratio: number; top: number }>();
let currentActiveIndex: number | null = null;
const activeIndexListeners = new Set<() => void>();

const notifyActiveIndex = (next: number | null) => {
  if (currentActiveIndex === next) return;

  currentActiveIndex = next;
  activeIndexListeners.forEach((listener) => listener());
};

const recalculateActiveIndex = () => {
  if (visibleItems.size === 0) {
    notifyActiveIndex(null);
    return;
  }

  let candidate: number | null = null;
  let minTop = Infinity;
  let maxRatio = -Infinity;

  visibleItems.forEach(({ top, ratio }, index) => {
    const shouldUpdate =
      top < minTop ||
      (top === minTop &&
        (ratio > maxRatio || (ratio === maxRatio && index < (candidate ?? Infinity))));

    if (shouldUpdate) {
      candidate = index;
      minTop = top;
      maxRatio = ratio;
    }
  });

  notifyActiveIndex(candidate ?? null);
};

export const setVirtuaGlobalRef = (ref: VirtuaRef) => {
  currentVirtuaRef = ref;
  refListeners.forEach((listener) => listener());
};

export const getVirtuaGlobalRef = () => currentVirtuaRef;

export const subscribeVirtuaGlobalRef = (listener: () => void) => {
  refListeners.add(listener);

  return () => {
    refListeners.delete(listener);
  };
};

export const upsertVirtuaVisibleItem = (
  index: number,
  metrics: { bottom: number; ratio: number; top: number },
) => {
  visibleItems.set(index, metrics);
  recalculateActiveIndex();
};

export const removeVirtuaVisibleItem = (index: number) => {
  if (!visibleItems.delete(index)) return;

  recalculateActiveIndex();
};

export const resetVirtuaVisibleItems = () => {
  if (visibleItems.size === 0 && currentActiveIndex === null) return;

  visibleItems.clear();
  notifyActiveIndex(null);
};

export const getVirtuaActiveIndex = () => currentActiveIndex;

export const subscribeVirtuaActiveIndex = (listener: () => void) => {
  activeIndexListeners.add(listener);

  return () => {
    activeIndexListeners.delete(listener);
  };
};
