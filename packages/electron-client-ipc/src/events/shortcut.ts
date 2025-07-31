import { ShortcutUpdateResult } from '../types';

export interface ShortcutDispatchEvents {
  getShortcutsConfig: () => Record<string, string>;
  updateShortcutConfig: (params: { accelerator: string; id: string }) => ShortcutUpdateResult;
}
