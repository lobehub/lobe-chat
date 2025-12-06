import type { DesktopIpcServices, DesktopServerIpcServices } from './controllers/registry';

declare module '@lobechat/electron-client-ipc' {
  interface DesktopIpcServicesMap extends DesktopIpcServices {}
}

export type { DesktopIpcServices, DesktopServerIpcServices };
