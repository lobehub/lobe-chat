import isEqual from 'fast-deep-equal';
import { parseAsBoolean, useQueryState } from 'nuqs';
import { useHotkeys } from 'react-hotkeys-hook';

import { GLOBAL_HOTKEY_SCOPE, KEY_NUMBER } from '@/const/hotkeys';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

export const useSwitchAgentHotkey = () => {
  const list = useSessionStore(sessionSelectors.pinnedSessions, isEqual);
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.SwitchAgent));
  const switchSession = useSwitchSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setPinned] = useQueryState('pinned', parseAsBoolean);

  const switchAgent = (id: string) => {
    switchSession(id);
    setPinned(true);
  };

  const ref = useHotkeys(
    list.slice(0, 9).map((e, i) => hotkey.replaceAll(KEY_NUMBER, String(i + 1))),
    (_, hotkeysEvent) => {
      if (!hotkeysEvent.keys?.[0]) return;
      const index = parseInt(hotkeysEvent.keys?.[0]) - 1;
      const item = list[index];
      if (!item) return;
      switchAgent(item.id);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
      scopes: [GLOBAL_HOTKEY_SCOPE, HotkeyEnum.SwitchAgent],
    },
  );

  return {
    id: HotkeyEnum.SwitchAgent,
    ref,
  };
};

// 注册聚合

export const useRegisterGlobalHotkeys = () => {
  // 全局自动注册不需要 enableScope
  useSwitchAgentHotkey();
};
