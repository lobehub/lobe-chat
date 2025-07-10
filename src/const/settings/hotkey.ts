import { HOTKEYS_REGISTRATION } from '@/const/hotkeys';
import { UserHotkeyConfig } from '@/types/user/settings';

export const DEFAULT_HOTKEY_CONFIG: UserHotkeyConfig = HOTKEYS_REGISTRATION.reduce(
  (acc: UserHotkeyConfig, item) => {
    acc[item.id] = item.keys;
    return acc;
  },
  {} as UserHotkeyConfig,
);
