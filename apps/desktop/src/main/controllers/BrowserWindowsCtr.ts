import { ipcMain } from 'electron';

import { ControllerModule, ipcClientEvent } from './index';

export default class BrowserWindowsCtr extends ControllerModule {
  constructor(props) {
    super(props);

    // 这部分逻辑应该要收到 browserControl 里去
    // 添加打开设置窗口的监听器 - 用于处理通过 ipcRenderer.send 方式发送的事件
    ipcMain.on('open-settings-window', async () => {
      console.log('[IPC] 收到从渲染进程发送的打开设置窗口请求');
      await this.openSettingsWindow();
    });
  }

  @ipcClientEvent('openSettingsWindow')
  async openSettingsWindow(tab?: string) {
    console.log('[IPC] 收到打开设置窗口的请求', tab);
    this.app.browserManager.showSettingsWindow();
  }
}
