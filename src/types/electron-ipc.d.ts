import type { DesktopIpcServices } from '../../apps/desktop/src/main/controllers/registry'

declare module '@lobechat/electron-client-ipc' {
  interface DesktopIpcServicesMap extends DesktopIpcServices {}
}
