export interface ChatMessage {
  content: string;
  id: string;
  role: 'user' | 'assistant';
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export type PageType = 'theme' | 'ai-chat' | string;
