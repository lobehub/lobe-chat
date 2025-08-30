'use client';

import type { IEditor } from '@lobehub/editor';
import { type ChatInputProps, useEditor } from '@lobehub/editor/react';
import { type ReactNode, RefObject, createContext, use, useRef, useState } from 'react';

import { ActionKeys } from '@/features/ChatInput/ActionBar/config';

export interface ChatInputProviderConfig {
  actions: ActionKeys[];
  allowExpand?: boolean;
  editorRef: RefObject<IEditor | null>;
  expand?: boolean;
  mobile?: boolean;
  setExpand?: (expend: boolean) => void;
  setShowTypoBar?: (show: boolean) => void;
  showTypoBar?: boolean;
  slashMenuRef: ChatInputProps['slashMenuRef'];
}

const defaultValue: ChatInputProviderConfig = {
  actions: [],
  allowExpand: true,
  editorRef: { current: null },
  slashMenuRef: { current: null },
};

const ChatInputContext = createContext<ChatInputProviderConfig>(defaultValue);

export interface ChatInputProviderProps {
  children: ReactNode;
  config?: Partial<ChatInputProviderConfig>;
}

export const ChatInputProvider = ({ children, config = {} }: ChatInputProviderProps) => {
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const editorRef = useEditor();
  const [expand, setExpand] = useState(config?.expand || false);
  const [showTypoBar, setShowTypoBar] = useState(config?.showTypoBar || false);
  return (
    <ChatInputContext.Provider
      value={
        {
          ...defaultValue,
          ...config,
          editorRef,
          expand,
          setExpand,
          setShowTypoBar,
          showTypoBar,
          slashMenuRef,
        } as ChatInputProviderConfig
      }
    >
      {children}
    </ChatInputContext.Provider>
  );
};

export const useChatInput = (): ChatInputProviderConfig => {
  return use(ChatInputContext);
};

ChatInputProvider.displayName = 'ChatInputProvider';
