import isEqual from 'fast-deep-equal';
import { useHotkeys } from 'react-hotkeys-hook';

import { INBOX_SESSION_ID } from '@/const/session';
import { usePinnedAgentState } from '@/hooks/usePinnedAgentState';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useGlobalStore } from '@/store/global';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum, HotkeyScopeEnum, KeyEnum } from '@/types/hotkey';

import { useHotkeyById } from './useHotkeyById';

export const useSwitchAgentHotkey = () => {
  const { showPinList } = useServerConfigStore(featureFlagsSelectors);
  const list = useSessionStore(sessionSelectors.pinnedSessions, isEqual);
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.SwitchAgent));
  const switchSession = useSwitchSession();
  const [, { pinAgent }] = usePinnedAgentState();

  const switchAgent = (id: string) => {
    switchSession(id);
    pinAgent();
  };

  const ref = useHotkeys(
    list.slice(0, 9).map((e, i) => hotkey.replaceAll(KeyEnum.Number, String(i + 1))),
    (_, hotkeysEvent) => {
      if (!hotkeysEvent.keys?.[0]) return;
      const index = parseInt(hotkeysEvent.keys?.[0]) - 1;
      const item = list[index];
      if (!item) return;
      switchAgent(item.id);
    },
    {
      enableOnFormTags: true,
      enabled: showPinList,
      preventDefault: true,
      scopes: [HotkeyScopeEnum.Global, HotkeyEnum.SwitchAgent],
    },
  );

  return {
    id: HotkeyEnum.SwitchAgent,
    ref,
  };
};

// 切换到会话标签(并聚焦到随便聊聊)
export const useNavigateToChatHotkey = () => {
  const switchSession = useSwitchSession();
  const [, { unpinAgent }] = usePinnedAgentState();

  return useHotkeyById(HotkeyEnum.NavigateToChat, () => {
    switchSession(INBOX_SESSION_ID);
    unpinAgent();
  });
};

export const useOpenHotkeyHelperHotkey = () => {
  const [open, updateSystemStatus] = useGlobalStore((s) => [
    s.status.showHotkeyHelper,
    s.updateSystemStatus,
  ]);

  return useHotkeyById(HotkeyEnum.OpenHotkeyHelper, () =>
    updateSystemStatus({ showHotkeyHelper: !open }),
  );
};

// 注册聚合

export const useRegisterGlobalHotkeys = () => {
  // 全局自动注册不需要 enableScope
  useSwitchAgentHotkey();
  useNavigateToChatHotkey();
  useOpenHotkeyHelperHotkey();
};
