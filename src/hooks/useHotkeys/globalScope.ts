import isEqual from 'fast-deep-equal';
import { useHotkeys } from 'react-hotkeys-hook';

import { INBOX_SESSION_ID } from '@/const/session';
import { useNavigateToAgent } from '@/hooks/useNavigateToAgent';
import { usePinnedAgentState } from '@/hooks/usePinnedAgentState';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
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
  const navigateToAgent = useNavigateToAgent();
  const [, { pinAgent }] = usePinnedAgentState();

  const switchAgent = (id: string) => {
    navigateToAgent(id);
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
  const navigateToAgent = useNavigateToAgent();
  const [, { unpinAgent }] = usePinnedAgentState();

  return useHotkeyById(HotkeyEnum.NavigateToChat, () => {
    navigateToAgent(INBOX_SESSION_ID);
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

export const useToggleLeftPanelHotkey = () => {
  const showSessionPanel = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return useHotkeyById(
    HotkeyEnum.ToggleLeftPanel,
    () =>
      updateSystemStatus({
        showSessionPanel: !showSessionPanel,
      }),
    {
      enableOnContentEditable: true,
    },
  );
};

// 注册聚合

export const useRegisterGlobalHotkeys = () => {
  // 全局自动注册不需要 enableScope
  useToggleLeftPanelHotkey();
  useSwitchAgentHotkey();
  useNavigateToChatHotkey();
  useOpenHotkeyHelperHotkey();
};
