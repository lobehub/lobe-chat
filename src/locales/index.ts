import { commonLocaleSet } from './common';
import { createI18nNext } from './create';

const initI18n = createI18nNext({ localSet: commonLocaleSet, namespace: 'common' });

export default initI18n;
