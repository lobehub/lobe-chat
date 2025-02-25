import { BrowserWindow, app, protocol, shell } from 'electron';
// import defaultMenu from 'electron-default-menu';
import { createHandler } from 'next-electron-rsc';
import path, { join } from 'node:path';

const isDev = process.env.NODE_ENV === 'development';
const appPath = app.getAppPath();
const localhostUrl = 'http://localhost:3010'; // must match Next.js dev server
let mainWindow;
let stopIntercept;

// Next.js handler
const standaloneDir = path.join(appPath,'out', 'standalone');
const { createInterceptor } = createHandler({
  debug: true,
  localhostUrl,
  protocol,
  standaloneDir,
});

// Next.js handler
const createWindow = async () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    height: 800,
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      preload: join(__dirname, '../preload/index.js'),
    },
    width: 1600,
  });

  // Next.js handler
  if (!isDev) {
    console.log(
      `[APP] Server Debugging Enabled, ${localhostUrl} will be intercepted to ${standaloneDir}`,
    );
    stopIntercept = createInterceptor({ session: mainWindow.webContents.session });
  }
  // Next.js handler
  mainWindow.once('ready-to-show', () => mainWindow.webContents.openDevTools());
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
  await mainWindow.loadURL(localhostUrl + '/');
  console.log('[APP] Loaded', localhostUrl);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => app.quit());

// if (process.platform !== 'darwin')

app.on(
  'activate',
  () => BrowserWindow.getAllWindows().length === 0 && !mainWindow && createWindow(),
);
