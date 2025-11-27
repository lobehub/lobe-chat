import { useEffect } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';

import { HotkeyScopeEnum } from '@/types/hotkey';

// 注册聚合
export const useRegisterFilesHotkeys = () => {
  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    enableScope(HotkeyScopeEnum.Files);
    return () => disableScope(HotkeyScopeEnum.Files);
  }, []);
};
