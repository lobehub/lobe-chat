import { LocalFilesDispatchEvents } from './localFile';
import { MenuDispatchEvents } from './menu';
import { RemoteServerBroadcastEvents, RemoteServerDispatchEvents } from './remoteServer';
import { DesktopSettingsDispatchEvents } from './settings';
import { ShortcutDispatchEvents } from './shortcut';
import { SystemBroadcastEvents, SystemDispatchEvents } from './system';
import { TrayDispatchEvents } from './tray';
import { AutoUpdateBroadcastEvents, AutoUpdateDispatchEvents } from './update';
import { UploadFilesDispatchEvents } from './upload';
import { WindowsDispatchEvents } from './windows';

/**
 * renderer -> main dispatch events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClientDispatchEvents
  extends WindowsDispatchEvents,
    SystemDispatchEvents,
    MenuDispatchEvents,
    LocalFilesDispatchEvents,
    AutoUpdateDispatchEvents,
    ShortcutDispatchEvents,
    RemoteServerDispatchEvents,
    UploadFilesDispatchEvents,
    TrayDispatchEvents,
    DesktopSettingsDispatchEvents {}

export type ClientDispatchEventKey = keyof ClientDispatchEvents;

export type ClientEventReturnType<T extends ClientDispatchEventKey> = ReturnType<
  ClientDispatchEvents[T]
>;

/**
 * main -> render broadcast events
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MainBroadcastEvents
  extends AutoUpdateBroadcastEvents,
    RemoteServerBroadcastEvents,
    SystemBroadcastEvents {}

export type MainBroadcastEventKey = keyof MainBroadcastEvents;

export type MainBroadcastParams<T extends MainBroadcastEventKey> = Parameters<
  MainBroadcastEvents[T]
>[0];
