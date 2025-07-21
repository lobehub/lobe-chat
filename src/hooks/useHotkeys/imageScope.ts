import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { FOLDER_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { HotkeyEnum, HotkeyScopeEnum } from '@/types/hotkey';

import { useHotkeyById } from './useHotkeyById';

export const useToggleImageLeftPanelHotkey = () => {
  const showImagePanel = useGlobalStore(systemStatusSelectors.showImagePanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return useHotkeyById(HotkeyEnum.ToggleLeftPanel, () =>
    updateSystemStatus({
      imagePanelWidth: showImagePanel ? 0 : FOLDER_WIDTH,
      showImagePanel: !showImagePanel,
    }),
  );
};

export const useToggleImageRightPanelHotkey = () => {
  const showImageTopicPanel = useGlobalStore(systemStatusSelectors.showImageTopicPanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  return useHotkeyById(HotkeyEnum.ToggleRightPanel, () =>
    updateSystemStatus({
      imageTopicPanelWidth: showImageTopicPanel ? 0 : 80,
      showImageTopicPanel: !showImageTopicPanel,
    }),
  );
};

// 注册聚合

export const useRegisterImageHotkeys = () => {
  const { enableScope, disableScope } = useHotkeysContext();

  // Layout
  useToggleImageLeftPanelHotkey();
  useToggleImageRightPanelHotkey();

  useEffect(() => {
    enableScope(HotkeyScopeEnum.Image);
    return () => disableScope(HotkeyScopeEnum.Image);
  }, []);
};
