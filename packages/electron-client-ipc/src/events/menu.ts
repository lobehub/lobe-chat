export interface MenuDispatchEvents {
  refreshAppMenu: () => { success: boolean };
  setDevMenuVisibility: (visible: boolean) => { success: boolean };
  showContextMenu: (type: string, data?: any) => { success: boolean };
}
