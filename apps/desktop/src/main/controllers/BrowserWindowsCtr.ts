import { InterceptRouteParams } from '@lobechat/electron-client-ipc';
import { extractSubPath, findMatchingRoute } from '~common/routes';

import { AppBrowsersIdentifiers, BrowsersIdentifiers } from '@/appBrowsers';
import { IpcClientEventSender } from '@/types/ipcClientEvent';

import { ControllerModule, ipcClientEvent, shortcut } from './index';

export default class BrowserWindowsCtr extends ControllerModule {
  @shortcut('showMainWindow')
  async toggleMainWindow() {
    const mainWindow = this.app.browserManager.getMainWindow();
    mainWindow.toggleVisible();
  }

  @ipcClientEvent('openSettingsWindow')
  async openSettingsWindow(tab?: string) {
    console.log('[BrowserWindowsCtr] Received request to open settings window', tab);

    try {
      await this.app.browserManager.showSettingsWindowWithTab(tab);

      return { success: true };
    } catch (error) {
      console.error('[BrowserWindowsCtr] Failed to open settings window:', error);
      return { error: error.message, success: false };
    }
  }

  @ipcClientEvent('closeWindow')
  closeWindow(data: undefined, sender: IpcClientEventSender) {
    this.app.browserManager.closeWindow(sender.identifier);
  }

  @ipcClientEvent('minimizeWindow')
  minimizeWindow(data: undefined, sender: IpcClientEventSender) {
    this.app.browserManager.minimizeWindow(sender.identifier);
  }

  @ipcClientEvent('maximizeWindow')
  maximizeWindow(data: undefined, sender: IpcClientEventSender) {
    this.app.browserManager.maximizeWindow(sender.identifier);
  }

  /**
   * Handle route interception requests
   * Responsible for handling route interception requests from the renderer process
   */
  @ipcClientEvent('interceptRoute')
  async interceptRoute(params: InterceptRouteParams) {
    const { path, source } = params;
    console.log(
      `[BrowserWindowsCtr] Received route interception request: ${path}, source: ${source}`,
    );

    // Find matching route configuration
    const matchedRoute = findMatchingRoute(path);

    // If no matching route found, return not intercepted
    if (!matchedRoute) {
      console.log(`[BrowserWindowsCtr] No matching route configuration found: ${path}`);
      return { intercepted: false, path, source };
    }

    console.log(
      `[BrowserWindowsCtr] Intercepted route: ${path}, target window: ${matchedRoute.targetWindow}`,
    );

    try {
      if (matchedRoute.targetWindow === BrowsersIdentifiers.settings) {
        const subPath = extractSubPath(path, matchedRoute.pathPrefix);

        await this.app.browserManager.showSettingsWindowWithTab(subPath);

        return {
          intercepted: true,
          path,
          source,
          subPath,
          targetWindow: matchedRoute.targetWindow,
        };
      } else {
        await this.openTargetWindow(matchedRoute.targetWindow as AppBrowsersIdentifiers);

        return {
          intercepted: true,
          path,
          source,
          targetWindow: matchedRoute.targetWindow,
        };
      }
    } catch (error) {
      console.error('[BrowserWindowsCtr] Error while processing route interception:', error);
      return {
        error: error.message,
        intercepted: false,
        path,
        source,
      };
    }
  }

  /**
   * Open target window and navigate to specified sub-path
   */
  private async openTargetWindow(targetWindow: AppBrowsersIdentifiers) {
    // Ensure the window can always be created or reopened
    const browser = this.app.browserManager.retrieveByIdentifier(targetWindow);
    browser.show();
  }
}
