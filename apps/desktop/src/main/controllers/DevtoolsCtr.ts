import { ControllerModule, ipcClientEvent } from './index';

export default class DevtoolsCtr extends ControllerModule {
  @ipcClientEvent('openDevtools')
  async openDevtools() {
    const devtoolsBrowser = this.app.browserManager.retrieveByIdentifier('devtools');
    devtoolsBrowser.show();
  }
}
