import { DEFAULT_PREFERENCE } from '@lobechat/const';

import type { UserState } from '@/store/user/initialState';

export const labPreferSelectors = {
  enableGroupChat: (s: UserState): boolean =>
    s.preference.lab?.enableGroupChat ?? DEFAULT_PREFERENCE.lab!.enableGroupChat!,
  enableInputMarkdown: (s: UserState): boolean =>
    s.preference.lab?.enableInputMarkdown ?? DEFAULT_PREFERENCE.lab!.enableInputMarkdown!,
};
