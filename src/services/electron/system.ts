import { ElectronAppState, dispatch } from '@lobechat/electron-client-ipc';

/**
 * Service class for interacting with Electron's system-level information and actions.
 */
class ElectronSystemService {
  /**
   * Fetches the application state from the Electron main process.
   * This includes system information (platform, arch) and user-specific paths.
   * @returns {Promise<DesktopAppState>} A promise that resolves with the desktop app state.
   */
  async getAppState(): Promise<ElectronAppState> {
    // Calls the underlying IPC function to get data from the main process
    return dispatch('getDesktopAppState');
  }

  async closeWindow(): Promise<void> {
    return dispatch('closeWindow');
  }

  async maximizeWindow(): Promise<void> {
    return dispatch('maximizeWindow');
  }

  async minimizeWindow(): Promise<void> {
    return dispatch('minimizeWindow');
  }

  showContextMenu = async (type: string, data?: any) => {
    return dispatch('showContextMenu', { data, type });
  };
}

// Export a singleton instance of the service
export const electronSystemService = new ElectronSystemService();
