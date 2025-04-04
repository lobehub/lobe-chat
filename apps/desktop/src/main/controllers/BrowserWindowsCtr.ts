import { ipcMain } from 'electron';

import { ControllerModule, ipcClientEvent } from './index';

export default class BrowserWindowsCtr extends ControllerModule {
  constructor(props) {
    super(props);

    // 添加打开设置窗口的监听器 - 用于处理通过 ipcRenderer.send 方式发送的事件
    ipcMain.on('open-settings-window', async (_, tab) => {
      console.log('[IPC] 收到从渲染进程发送的打开设置窗口请求', tab);
      await this.openSettingsWindow(tab);
    });
  }

  @ipcClientEvent('openSettingsWindow')
  async openSettingsWindow(tab?: string) {
    console.log('[BrowserWindowsCtr] 收到打开设置窗口的请求', tab);

    try {
      // 使用redirectToTab打开设置窗口
      if (tab) {
        this.app.browserManager.redirectToTab('settings', tab);
      } else {
        const browser = this.app.browserManager.retrieveByIdentifier('settings');
        browser.show();
      }
      return { success: true };
    } catch (error) {
      console.error('[BrowserWindowsCtr] 打开设置窗口失败:', error);
      return { error: error.message, success: false };
    }
  }
}
