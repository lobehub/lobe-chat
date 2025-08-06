export interface MenuDispatchEvents {
  refreshAppMenu: () => { success: boolean };
  setDevMenuVisibility: (visible: boolean) => { success: boolean };
  showContextMenu: (params: { data?: any; type: string }) => { success: boolean };
}
