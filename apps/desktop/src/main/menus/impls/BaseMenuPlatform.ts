// apps/desktop/src/main/menus/impl/BaseMenuPlatform.ts
import type { App } from '@/core/App';

export abstract class BaseMenuPlatform {
  protected app: App;

  constructor(app: App) {
    this.app = app;
  }
}
