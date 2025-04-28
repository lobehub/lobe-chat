import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { HotkeyEnum, HotkeyScopeEnum } from '@/types/hotkey';

import { useHotkeyById } from './useHotkeyById';

export const useToggleFilesLeftPanelHotkey = () => {
  const showFilePanel = useGlobalStore(systemStatusSelectors.showFilePanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return useHotkeyById(HotkeyEnum.ToggleLeftPanel, () =>
    updateSystemStatus({
      filePanelWidth: showFilePanel ? 0 : FOLDER_WIDTH,
      showFilePanel: !showFilePanel,
    }),
  );
};

// 注册聚合

export const useRegisterFilesHotkeys = () => {
  const { enableScope, disableScope } = useHotkeysContext();

  // Layout
  useToggleFilesLeftPanelHotkey();

  useEffect(() => {
    enableScope(HotkeyScopeEnum.Files);
    return () => disableScope(HotkeyScopeEnum.Files);
  }, []);

  return null;
};
