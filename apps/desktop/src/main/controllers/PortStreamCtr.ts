import type { PortStreamHeadParams, PortStreamOpenParams } from '@lobechat/electron-client-ipc';

import { getIpcContext } from '@/utils/ipc';

import { ControllerModule, IpcMethod } from './index';

/**
 * Opens ordered main → renderer port streams. The port is posted back to the
 * calling window on `PORT_STREAM_IPC_CHANNEL`; the preload hands it to the page.
 */
export default class PortStreamCtr extends ControllerModule {
  static override readonly groupName = 'portStream';

  @IpcMethod()
  async open(params: PortStreamOpenParams): Promise<void> {
    const sender = getIpcContext()?.sender;
    if (!sender) throw new Error('portStream.open must be called over IPC');

    this.app.portStreamManager.open(sender, params);
  }

  /**
   * Seq of the newest published frame. The reply travels on the IPC pipe, so
   * it is ordered after replies to earlier invokes; a renderer that waits for
   * its port to reach this seq has seen everything published before them.
   */
  @IpcMethod()
  async head(params: PortStreamHeadParams): Promise<number> {
    return this.app.portStreamManager.head(params.name, params.key);
  }
}
