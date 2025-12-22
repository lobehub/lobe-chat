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
  type: MenuContext;
}

export type MenuContext =
  | 'general'
  | 'agent'
  | 'group'
  | 'resource'
  | 'settings'
  | 'memory'
  | 'community'
  | 'page'
  | 'painting';

export type ContextType = Extract<MenuContext, 'agent' | 'group' | 'resource' | 'settings' | 'page' | 'painting'>;
