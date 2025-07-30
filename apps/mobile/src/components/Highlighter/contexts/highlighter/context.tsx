import type { ThemedToken } from '@shikijs/core';
import { createContext } from 'react';

export interface HighlighterContextType {
  dispose: () => void;
  initialize: () => Promise<void>;
  tokenize: (code: string, options: { lang: string; theme: string }) => ThemedToken[][];
}

export const HighlighterContext = createContext<HighlighterContextType | null>(null);
