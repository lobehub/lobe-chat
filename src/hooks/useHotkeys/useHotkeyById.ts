import { DependencyList } from 'react';
import { type HotkeyCallback, type Options, useHotkeys } from 'react-hotkeys-hook';

import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyId } from '@/types/hotkey';
import { isDev } from '@/utils/env';

type OptionsOrDependencyArray = Options | DependencyList;

export const useHotkeyById = (
  hotkeyId: HotkeyId,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray,
) => {
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(hotkeyId));

  const _options: Options | undefined = !Array.isArray(options)
    ? (options as Options)
    : !Array.isArray(dependencies)
      ? (dependencies as Options)
      : undefined;

  const _deps: DependencyList | undefined = Array.isArray(options)
    ? options
    : Array.isArray(dependencies)
      ? dependencies
      : undefined;

  const ref = useHotkeys(
    hotkey,
    (...props) => {
      if (isDev) console.log('[Hotkey]', hotkeyId);
      return callback(...props);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
      ..._options,
      scopes: [hotkeyId, ...(_options?.scopes || [])],
    },
    _deps,
  );

  return {
    id: hotkeyId,
    ref,
  };
};
