import { BrowserWindow, app, ipcMain, protocol, shell } from 'electron';
import { macOS } from 'electron-is';
import { createHandler } from 'next-electron-rsc';
import path, { join } from 'node:path';

import { initIPCServer } from './core/IPCServer';

const isDev = process.env.NODE_ENV === 'development';
const appPath = app.getAppPath();
const localhostUrl = 'http://localhost:3010'; // must match Next.js dev server

const mainDir = join(__dirname);
const preloadDir = join(mainDir, '../preload');

const resourcesDir = join(__dirname, '../../resources');

let mainWindow: BrowserWindow | null;
let stopIntercept;

if (isDev) {
  app.setName('LobeHub Dev');
  if (macOS()) {
    app.dock!.setIcon(path.join(__dirname, '../../build/icon-dev.png'));
  }
}

// Next.js handler
const standaloneDir = path.join(appPath, 'dist', 'next');

let createInterceptor;
if (!isDev) {
  const handler = createHandler({
    debug: true,
    localhostUrl,
    protocol,
    standaloneDir,
  });
  createInterceptor = handler.createInterceptor;
}

const createWindow = async () => {
  await initIPCServer();

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 800,
    minWidth: 400,
    show: false,
    titleBarStyle: 'hidden',
    vibrancy: 'under-window',
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      preload: join(preloadDir, 'index.js'),
    },
    width: 1200,
  });

  // Next.js handler
  if (!isDev) {
    console.log(
      `[APP] Server Debugging Enabled, ${localhostUrl} will be intercepted to ${standaloneDir}`,
    );
    stopIntercept = createInterceptor({ session: mainWindow.webContents.session });
  }

  // Windows 11 可以使用这个新 API
  if (process.platform === 'win32' && mainWindow.setBackgroundMaterial) {
    mainWindow.setBackgroundMaterial('acrylic');
  }
  // 首先加载一个本地的HTML加载页面
  await mainWindow.loadFile(path.join(resourcesDir, 'splash.html'));

  mainWindow.show();

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopIntercept?.();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url).catch((e) => console.error(e));

    return { action: 'deny' };
  });
  // Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)));
  // Should be last, after all listeners and menu
  await app.whenReady();

  const initUrl = localhostUrl + '/chat';

  try {
    await mainWindow.loadURL(initUrl);
    console.log('[APP] Loaded', initUrl);
  } catch (error) {
    console.error('[APP] Failed to load URL:', error);

    // 加载本地错误页面
    await mainWindow.loadFile(path.join(resourcesDir, 'error.html'));

    // 设置简单的重试逻辑
    ipcMain.on('retry-connection', async () => {
      try {
        await mainWindow?.loadURL(initUrl);
        console.log('[APP] Reconnected successfully');
      } catch (err) {
        console.error('[APP] Retry failed:', err);
        // 重新加载错误页面，重置状态
        mainWindow?.loadFile(path.join(resourcesDir, 'error.html'));
      }
    });
  }
};

app.on('ready', createWindow);

app.on(
  'activate',
  () => BrowserWindow.getAllWindows().length === 0 && !mainWindow && createWindow(),
);

ipcMain.handle('openDevtools', async () => {
  console.log('open-devtool');

  const window = new BrowserWindow({
    autoHideMenuBar: true,
    fullscreenable: false,
    height: 600,
    maximizable: false,
    minWidth: 400,
    show: false,
    titleBarStyle: 'hiddenInset', // 或 'customButtonsOnHover'
    vibrancy: 'under-window',
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      preload: join(preloadDir, 'index.js'),
    },
    width: 1000,
  });

  await window.loadURL(localhostUrl + '/desktop/devtools');

  window.show();
});
