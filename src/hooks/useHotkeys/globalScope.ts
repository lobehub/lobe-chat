import { INBOX_SESSION_ID } from '@lobechat/const';
import { HotkeyEnum } from '@lobechat/types';

import { useNavigateToAgent } from '@/hooks/useNavigateToAgent';
import { usePinnedAgentState } from '@/hooks/usePinnedAgentState';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { useHotkeyById } from './useHotkeyById';

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

export const useCommandPaletteHotkey = () => {
  const [open, updateSystemStatus] = useGlobalStore((s) => [
    s.status.showCommandMenu,
    s.updateSystemStatus,
  ]);

  return useHotkeyById(
    HotkeyEnum.CommandPalette,
    () => updateSystemStatus({ showCommandMenu: !open }),
    {
      enableOnContentEditable: true,
    },
  );
};

// 注册聚合

export const useRegisterGlobalHotkeys = () => {
  // 全局自动注册不需要 enableScope
  useToggleLeftPanelHotkey();
  useNavigateToChatHotkey();
  useOpenHotkeyHelperHotkey();
  useCommandPaletteHotkey();
};
