import { Definition, Root } from 'mdast';
import React, { createContext, useContext } from 'react';
import { ColorValue, ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { Renderers } from './renderers/renderers';

export type RemarkStyles = {
  blockquote?: ViewStyle;
  borderColor: ColorValue;
  break?: TextStyle;
  container?: ViewStyle;
  delete?: TextStyle;
  emphasis?: TextStyle;
  footnoteReference?: TextStyle;
  heading?: (level: number) => TextStyle;
  image?: ImageStyle;
  inlineCode?: TextStyle;
  link?: TextStyle;
  linkReference?: TextStyle;
  list?: ViewStyle;
  listItem?: ViewStyle;
  paragraph?: TextStyle;
  strong?: TextStyle;
  tableCell?: TextStyle;
  text?: TextStyle;
  thematicBreak?: ViewStyle;
  tr?: ViewStyle;
};

export type MarkdownContextType = {
  contentSize: { height: number; width: number };
  definitions: Record<string, Definition>;
  renderers: Renderers;
  styles: Partial<RemarkStyles>;
  tree: Root;
};

export const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const useMarkdownContext = (): MarkdownContextType => {
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
  renderers: Renderers;
  styles: Partial<RemarkStyles>;
  tree: Root;
};

export const MarkdownContextProvider = ({
  children,
  contentSize,
  definitions,
  renderers,
  styles,
  tree,
}: MarkdownContextProviderProps) => {
  return (
    <MarkdownContext.Provider value={{ contentSize, definitions, renderers, styles, tree }}>
      {children}
    </MarkdownContext.Provider>
  );
};
