export interface ShortcutDispatchEvents {
  getShortcutsConfig: () => Record<string, string>;
  updateShortcutConfig: (id: string, accelerator: string) => boolean;
}
