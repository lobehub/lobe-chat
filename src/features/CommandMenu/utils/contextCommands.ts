import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  ChartColumnBigIcon,
  EthernetPort,
  Image as ImageIcon,
  Info,
  KeyIcon,
  KeyboardIcon,
  Palette as PaletteIcon,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

import type { ContextType } from '../types';

export interface ContextCommand {
  icon: LucideIcon;
  keywords: string[];
  label: string;
  path: string;
  subPath: string;
}

/**
 * Map of context types to their available commands
 */
export const CONTEXT_COMMANDS: Record<ContextType, ContextCommand[]> = {
  agent: [],
  page: [],
  painting: [],
  resource: [],
  settings: [
    {
      icon: UserCircle,
      keywords: ['profile', 'user', 'account', 'personal'],
      label: 'Profile',
      path: '/settings/profile',
      subPath: 'profile',
    },
    {
      icon: PaletteIcon,
      keywords: ['common', 'appearance', 'theme', 'display'],
      label: 'Appearance',
      path: '/settings/common',
      subPath: 'common',
    },
    {
      icon: Brain,
      keywords: ['provider', 'llm', 'model', 'ai'],
      label: 'Model Provider',
      path: '/settings/provider',
      subPath: 'provider',
    },
    {
      icon: KeyboardIcon,
      keywords: ['hotkey', 'shortcut', 'keyboard'],
      label: 'Hotkeys',
      path: '/settings/hotkey',
      subPath: 'hotkey',
    },
    {
      icon: ImageIcon,
      keywords: ['image', 'picture', 'photo'],
      label: 'Image Settings',
      path: '/settings/image',
      subPath: 'image',
    },
    {
      icon: EthernetPort,
      keywords: ['proxy', 'network', 'connection'],
      label: 'Proxy',
      path: '/settings/proxy',
      subPath: 'proxy',
    },
    {
      icon: ShieldCheck,
      keywords: ['security', 'password', 'auth'],
      label: 'Security',
      path: '/settings/security',
      subPath: 'security',
    },
    {
      icon: ChartColumnBigIcon,
      keywords: ['stats', 'statistics', 'analytics'],
      label: 'Statistics',
      path: '/settings/stats',
      subPath: 'stats',
    },
    {
      icon: KeyIcon,
      keywords: ['apikey', 'api', 'key', 'token'],
      label: 'API Keys',
      path: '/settings/apikey',
      subPath: 'apikey',
    },
    {
      icon: Info,
      keywords: ['about', 'version', 'info'],
      label: 'About',
      path: '/settings/about',
      subPath: 'about',
    },
  ],
};

/**
 * Get context-specific commands based on context type and current sub-path
 * Filters out the current page from the list
 */
export const getContextCommands = (
  contextType: ContextType,
  currentSubPath?: string,
): ContextCommand[] => {
  const commands = CONTEXT_COMMANDS[contextType] || [];

  // Filter out the current page
  return commands.filter((cmd) => cmd.subPath !== currentSubPath);
};
