import { RefObject, createContext } from 'react';
import { ListRange, VirtuosoHandle } from 'react-virtuoso';

export const VirtuosoContext = createContext<RefObject<VirtuosoHandle | null> | null>(null);

type VirtuosoRef = RefObject<VirtuosoHandle | null> | null;
type VirtuosoRange = ListRange | null;

let currentVirtuosoRef: VirtuosoRef = null;
const listeners = new Set<() => void>();
let currentVirtuosoRange: VirtuosoRange = null;
const rangeListeners = new Set<() => void>();

export const setVirtuosoGlobalRef = (ref: VirtuosoRef) => {
  currentVirtuosoRef = ref;
  listeners.forEach((listener) => listener());
};

export const getVirtuosoGlobalRef = () => currentVirtuosoRef;

export const subscribeVirtuosoGlobalRef = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const setVirtuosoViewportRange = (range: VirtuosoRange) => {
  currentVirtuosoRange = range;
  rangeListeners.forEach((listener) => listener());
};

export const getVirtuosoViewportRange = () => currentVirtuosoRange;

export const subscribeVirtuosoViewportRange = (listener: () => void) => {
  rangeListeners.add(listener);

  return () => {
    rangeListeners.delete(listener);
  };
};
