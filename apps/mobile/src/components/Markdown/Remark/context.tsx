import { Definition, Root } from 'mdast';
import React, { createContext, useContext } from 'react';

import { Renderers } from './renderers/renderers';
import { Styles } from './themes/themes';

export type MarkdownContextType = {
  contentSize: { height: number; width: number };
  definitions: Record<string, Definition>;
  onCodeCopy?: (code: string) => void;
  onLinkPress?: (url: string) => void;
  renderers: Renderers;
  styles: Partial<Styles>;
  tree: Root;
};

export const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const useMarkdownContext = () => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error('useMarkdownContext must be used within a MarkdownContextProvider');
  }
  return context;
};

export type MarkdownContextProviderProps = {
  children: React.ReactNode;
  contentSize: { height: number; width: number };
  definitions: Record<string, Definition>;
  onCodeCopy?: (code: string) => void;
  onLinkPress?: (url: string) => void;
  renderers: Renderers;
  styles: Partial<Styles>;
  tree: Root;
};

export const MarkdownContextProvider = ({
  tree,
  renderers,
  definitions,
  contentSize,
  styles,
  onCodeCopy,
  onLinkPress,
  children,
}: MarkdownContextProviderProps) => {
  return (
    <MarkdownContext.Provider
      value={{
        contentSize,
        definitions,
        onCodeCopy,
        onLinkPress,
        renderers,
        styles,
        tree,
      }}
    >
      {children}
    </MarkdownContext.Provider>
  );
};
