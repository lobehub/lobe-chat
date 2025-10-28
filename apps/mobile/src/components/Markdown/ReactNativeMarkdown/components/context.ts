import { createContext } from 'react';

export const ListContext = createContext<{ getIndex?: () => number; type: 'ol' | 'ul' }>({
  getIndex: () => 0,
  type: 'ul',
});

export type BlockType = 'p' | 'blockquote' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export const BlockContext = createContext<{
  type: BlockType;
}>({
  type: 'p',
});
