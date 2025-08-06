import { Menu, MenuItemConstructorOptions, app, shell } from 'electron';
import * as path from 'node:path';

import { isDev } from '@/const/env';

import type { IMenuPlatform, MenuOptions } from '../types';
import { BaseMenuPlatform } from './BaseMenuPlatform';

export class MacOSMenu extends BaseMenuPlatform implements IMenuPlatform {
  private appMenu: Menu | null = null;
  private trayMenu: Menu | null = null;

  buildAndSetAppMenu(options?: MenuOptions): Menu {
    const template = this.getAppMenuTemplate(options);

    this.appMenu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(this.appMenu);

    return this.appMenu;
  }

  buildContextMenu(type: string, data?: any): Menu {
    let template: MenuItemConstructorOptions[];
    switch (type) {
      case 'chat': {
        template = this.getChatContextMenuTemplate(data);
        break;
      }
      case 'editor': {
        template = this.getEditorContextMenuTemplate(data);
        break;
      }
      default: {
        template = this.getDefaultContextMenuTemplate();
      }
    }
    return Menu.buildFromTemplate(template);
  }

  buildTrayMenu(): Menu {
    const template = this.getTrayMenuTemplate();
    this.trayMenu = Menu.buildFromTemplate(template);
    return this.trayMenu;
  }

  refresh(options?: MenuOptions): void {
    // 重建应用菜单
    this.buildAndSetAppMenu(options);
    // 如果托盘菜单存在，也重建它（如果需要动态更新）
    // this.trayMenu = this.buildTrayMenu();
    // 需要考虑如何更新现有托盘图标的菜单
  }

  // --- 私有方法：定义菜单模板和逻辑 ---

  private getAppMenuTemplate(options?: MenuOptions): MenuItemConstructorOptions[] {
    const appName = app.getName();
    const showDev = isDev || options?.showDevItems;

    // 创建命名空间翻译函数
    const t = this.app.i18n.ns('menu');

    // 添加调试日志
    // console.log('[MacOSMenu] 菜单渲染, i18n实例:', !!this.app.i18n);

    const template: MenuItemConstructorOptions[] = [
      {
        label: appName,
        submenu: [
          {
            label: t('macOS.about', { appName }),
            role: 'about',
          },
          {
            click: () => {
              this.app.updaterManager.checkForUpdates({ manual: true });
            },
            label: t('common.checkUpdates'),
          },
          { type: 'separator' },
          {
            accelerator: 'Command+,',
            click: () => {
              this.app.browserManager.showSettingsWindow();
            },
            label: t('macOS.preferences'),
          },
          { type: 'separator' },
          {
            label: t('macOS.services'),
            role: 'services',
            submenu: [],
          },
          { type: 'separator' },
          {
            accelerator: 'Command+H',
            label: t('macOS.hide', { appName }),
            role: 'hide',
          },
          {
            accelerator: 'Command+Alt+H',
            label: t('macOS.hideOthers'),
            role: 'hideOthers',
          },
          {
            label: t('macOS.unhide'),
            role: 'unhide',
          },
          { type: 'separator' },
          {
            accelerator: 'Command+Q',
            label: t('file.quit'),
            role: 'quit',
          },
        ],
      },
      {
        label: t('file.title'),
        submenu: [
          {
            accelerator: 'Command+W',
            label: t('window.close'),
            role: 'close',
          },
        ],
      },
      {
        label: t('edit.title'),
        submenu: [
          { accelerator: 'Command+Z', label: t('edit.undo'), role: 'undo' },
          { accelerator: 'Shift+Command+Z', label: t('edit.redo'), role: 'redo' },
          { type: 'separator' },
          { accelerator: 'Command+X', label: t('edit.cut'), role: 'cut' },
          { accelerator: 'Command+C', label: t('edit.copy'), role: 'copy' },
          { accelerator: 'Command+V', label: t('edit.paste'), role: 'paste' },
          { type: 'separator' },
          {
            label: t('edit.speech'),
            submenu: [
              { label: t('edit.startSpeaking'), role: 'startSpeaking' },
              { label: t('edit.stopSpeaking'), role: 'stopSpeaking' },
            ],
          },
          { type: 'separator' },
          { accelerator: 'Command+A', label: t('edit.selectAll'), role: 'selectAll' },
        ],
      },
      {
        label: t('view.title'),
        submenu: [
          { label: t('view.reload'), role: 'reload' },
          { label: t('view.forceReload'), role: 'forceReload' },
          { accelerator: 'F12', label: t('dev.devTools'), role: 'toggleDevTools' },
          { type: 'separator' },
          { accelerator: 'Command+0', label: t('view.resetZoom'), role: 'resetZoom' },
          { accelerator: 'Command+Plus', label: t('view.zoomIn'), role: 'zoomIn' },
          { accelerator: 'Command+-', label: t('view.zoomOut'), role: 'zoomOut' },
          { type: 'separator' },
          { accelerator: 'F11', label: t('view.toggleFullscreen'), role: 'togglefullscreen' },
        ],
      },
      {
        label: t('window.title'),
        role: 'windowMenu',
      },
      {
        label: t('help.title'),
        role: 'help',
        submenu: [
          {
            click: async () => {
              await shell.openExternal('https://lobehub.com');
            },
            label: t('help.visitWebsite'),
          },
          {
            click: async () => {
              await shell.openExternal('https://github.com/lobehub/lobe-chat');
            },
            label: t('help.githubRepo'),
          },
          {
            click: async () => {
              await shell.openExternal('https://github.com/lobehub/lobe-chat/issues/new/choose');
            },
            label: t('help.reportIssue'),
          },
          { type: 'separator' },
          {
            click: () => {
              const logsPath = app.getPath('logs');
              console.log(`[Menu] Opening logs directory: ${logsPath}`);
              shell.openPath(logsPath).catch((err) => {
                console.error(`[Menu] Error opening path ${logsPath}:`, err);
                // Optionally show an error dialog to the user
              });
            },
            label: '打开日志目录',
          },
          {
            click: () => {
              const userDataPath = app.getPath('userData');
              console.log(`[Menu] Opening user data directory: ${userDataPath}`);
              shell.openPath(userDataPath).catch((err) => {
                console.error(`[Menu] Error opening path ${userDataPath}:`, err);
                // Optionally show an error dialog to the user
              });
            },
            label: '配置目录',
          },
        ],
      },
    ];

    if (showDev) {
      template.push({
        label: t('dev.title'),
        submenu: [
          {
            click: () => {
              this.app.browserManager.retrieveByIdentifier('devtools').show();
            },
            label: t('dev.devPanel'),
          },
          {
            click: () => {
              this.app.menuManager.rebuildAppMenu();
            },
            label: t('dev.refreshMenu'),
          },
          { type: 'separator' },
          {
            click: () => {
              const userDataPath = app.getPath('userData');
              shell.openPath(userDataPath).catch((err) => {
                console.error(`[Menu] Error opening path ${userDataPath}:`, err);
              });
            },
            label: '用户配置目录',
          },
          {
            click: () => {
              // @ts-expect-error cache 目录好像暂时不在类型定义里
              const cachePath = app.getPath('cache');

              const updaterCachePath = path.join(cachePath, `${app.getName()}-updater`);
              shell.openPath(updaterCachePath).catch((err) => {
                console.error(`[Menu] Error opening path ${updaterCachePath}:`, err);
              });
            },
            label: '更新缓存目录',
          },
          {
            click: () => {
              this.app.storeManager.openInEditor();
            },
            label: '打开 Settings 配置文件',
          },
          { type: 'separator' },
          {
            label: '自动更新测试模拟',
            submenu: [
              {
                click: () => {
                  this.app.updaterManager.simulateUpdateAvailable();
                },
                label: '模拟启动后台自动下载更新（3s 下完）',
              },
              {
                click: () => {
                  this.app.updaterManager.simulateDownloadProgress();
                },
                label: '模拟下载进度',
              },
              {
                click: () => {
                  this.app.updaterManager.simulateUpdateDownloaded();
                },
                label: '模拟下载完成',
              },
            ],
          },
        ],
      });
    }

    return template;
  }

  private getDefaultContextMenuTemplate(): MenuItemConstructorOptions[] {
    const t = this.app.i18n.ns('menu');

    return [
      { label: t('edit.cut'), role: 'cut' },
      { label: t('edit.copy'), role: 'copy' },
      { label: t('edit.paste'), role: 'paste' },
      { label: t('edit.selectAll'), role: 'selectAll' },
      { type: 'separator' },
    ];
  }

  private getChatContextMenuTemplate(data?: any): MenuItemConstructorOptions[] {
    console.log(data);
    const t = this.app.i18n.ns('menu');

    return [
      { accelerator: 'Command+C', label: t('edit.copy'), role: 'copy' },
      { accelerator: 'Command+V', label: t('edit.paste'), role: 'paste' },
      { type: 'separator' },
      { label: t('edit.selectAll'), role: 'selectAll' },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getEditorContextMenuTemplate(_data?: any): MenuItemConstructorOptions[] {
    const t = this.app.i18n.ns('menu');

    return [
      { accelerator: 'Command+X', label: t('edit.cut'), role: 'cut' },
      { accelerator: 'Command+C', label: t('edit.copy'), role: 'copy' },
      { accelerator: 'Command+V', label: t('edit.paste'), role: 'paste' },
      { type: 'separator' },
      { accelerator: 'Command+A', label: t('edit.selectAll'), role: 'selectAll' },
      { type: 'separator' },
      { label: t('edit.delete'), role: 'delete' },
    ];
  }

  private getTrayMenuTemplate(): MenuItemConstructorOptions[] {
    const t = this.app.i18n.ns('menu');
    const appName = app.getName();

    return [
      {
        click: () => this.app.browserManager.showMainWindow(),
        label: t('tray.show', { appName }),
      },
      {
        click: () => this.app.browserManager.retrieveByIdentifier('settings').show(),
        label: t('file.preferences'),
      },
      { type: 'separator' },
      { label: t('tray.quit'), role: 'quit' },
    ];
  }
}
