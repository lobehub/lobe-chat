import type { resources } from './index';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources;
  }
}
