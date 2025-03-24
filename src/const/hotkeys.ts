import { HotkeyRegistration } from '@/types/hotkey';

export const ALT_KEY = 'alt';
export const META_KEY = 'mod';
export const SAVE_TOPIC_KEY = 'n';
export const CLEAN_MESSAGE_KEY = 'backspace';

export const HOTKEYS = {
  chatSettings: 'mod+comma',
  regenerate: 'alt+r',
  saveTopic: 'alt+n',
  zenMode: 'mod+\\',
};

export const HOTKEYS_REGISTRATION: HotkeyRegistration = [
  {
    id: 'openSettings',
    isDesktop: false,
    keys: 'mod+comma',
  },
  {
    id: 'regenerateMessage',
    isDesktop: false,
    keys: 'alt+r',
  },
  {
    id: 'saveTopic',
    isDesktop: false,
    keys: 'alt+n',
  },
  {
    id: 'switchZenMode',
    isDesktop: false,
    keys: 'mod+\\',
  },
];
