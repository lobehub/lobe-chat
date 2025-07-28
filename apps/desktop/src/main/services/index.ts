import type { App } from '../core/App';

export class ServiceModule {
  constructor(public app: App) {
    this.app = app;
  }
}

export type IServiceModule = typeof ServiceModule;
