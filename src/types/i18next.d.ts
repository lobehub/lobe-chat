import { DefaultResources } from '@/types/locale';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: ['common', 'setting'];
    resources: DefaultResources;
  }
}
