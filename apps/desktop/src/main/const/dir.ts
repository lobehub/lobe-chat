import { app } from 'electron';
import { join } from 'node:path';

export const mainDir = join(__dirname);

export const preloadDir = join(mainDir, '../preload');

export const resourcesDir = join(mainDir, '../../resources');

export const buildDir = join(mainDir, '../../build');

const appPath = app.getAppPath();

export const nextStandaloneDir = join(appPath, 'dist', 'next');

export const userDataDir = app.getPath('userData');
