export interface WindowsDispatchEvents {
  /**
   * open the LobeHub Devtools
   */
  openDevtools: () => void;

  openSettingsWindow: (tab?: string) => void;
}
