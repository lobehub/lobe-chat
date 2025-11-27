import { type RefObject, createContext, useContext } from 'react';

interface ScrollParentContextValue {
  scrollRef: RefObject<HTMLDivElement | null> | null;
}

const ScrollParentContext = createContext<ScrollParentContextValue | undefined>(undefined);

export const useScrollParent = () => {
  const context = useContext(ScrollParentContext);
  if (context === undefined) {
    throw new Error('useScrollParent must be used within a ScrollParentProvider');
  }
  return context.scrollRef;
};

export const ScrollParentProvider = ScrollParentContext.Provider;
