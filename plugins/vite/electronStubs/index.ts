import path from 'node:path';

const stub = (file: string) => path.resolve(import.meta.dirname, file);

const SERVICES = [
  'auv',
  'binary',
  'browserControl',
  'browserSidebar',
  'desktopExportService',
  'desktopNotification',
  'gatewayConnection',
  'git',
  'heterogeneousAgent',
  'localFileService',
  'remoteServer',
  'system',
];

export const electronClientStubs = (): Record<string, string> => ({
  '@/store/electron': stub('electronStore.ts'),
  '@/store/electron/selectors': stub('electronSelectors.ts'),
  '@/utils/electron/ipc': stub('utilsIpc.ts'),
  '@/utils/electron/localFilePath': stub('utilsLocalFilePath.ts'),
  '@lobechat/electron-client-ipc': stub('clientIpc.ts'),
  ...Object.fromEntries(
    SERVICES.map((name) => [`@/services/electron/${name}`, stub(`services/${name}.ts`)]),
  ),
});
