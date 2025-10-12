import { RefObject, createContext } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

export const VirtuosoContext = createContext<RefObject<VirtuosoHandle | null> | null>(null);

type VirtuosoRef = RefObject<VirtuosoHandle | null> | null;

let currentVirtuosoRef: VirtuosoRef = null;
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

export const setVirtuosoGlobalRef = (ref: VirtuosoRef) => {
  currentVirtuosoRef = ref;
  refListeners.forEach((listener) => listener());
};

export const getVirtuosoGlobalRef = () => currentVirtuosoRef;

export const subscribeVirtuosoGlobalRef = (listener: () => void) => {
  refListeners.add(listener);

  return () => {
    refListeners.delete(listener);
  };
};

export const upsertVirtuosoVisibleItem = (
  index: number,
  metrics: { bottom: number; ratio: number; top: number },
) => {
  visibleItems.set(index, metrics);
  recalculateActiveIndex();
};

export const removeVirtuosoVisibleItem = (index: number) => {
  if (!visibleItems.delete(index)) return;

  recalculateActiveIndex();
};

export const resetVirtuosoVisibleItems = () => {
  if (visibleItems.size === 0 && currentActiveIndex === null) return;

  visibleItems.clear();
  notifyActiveIndex(null);
};

export const getVirtuosoActiveIndex = () => currentActiveIndex;

export const subscribeVirtuosoActiveIndex = (listener: () => void) => {
  activeIndexListeners.add(listener);

  return () => {
    activeIndexListeners.delete(listener);
  };
};
