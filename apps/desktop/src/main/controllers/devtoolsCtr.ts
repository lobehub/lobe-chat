import { devtools } from '../appBrowsers';
import { ControllerModule } from './index';

export default class DevtoolsCtr extends ControllerModule {
  // @event('openDevtools')
  async openDevtools() {
    this.app.browserManager.retrieveOrInitialize(devtools);
  }
}
