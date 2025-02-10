import { GlobalStore } from '@/store/global';

import { systemStatus } from './systemStatus';

const language = (s: GlobalStore) => systemStatus(s).language || 'auto';

export const globalGeneralSelectors = {
  language,
};


export { language };