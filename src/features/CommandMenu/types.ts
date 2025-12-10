export interface ChatMessage {
  content: string;
  id: string;
  role: 'user' | 'assistant';
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export type PageType = 'theme' | 'ai-chat' | string;

export interface Context {
  name: string;
  subPath?: string;
  type: ContextType;
}

export type ContextType = 'agent' | 'painting' | 'settings' | 'resource' | 'page';
