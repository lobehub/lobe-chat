import { createI18nNext } from './create';
import { commonLocaleSet } from './namespaces';

const initI18n = createI18nNext({ localSet: commonLocaleSet, namespace: 'common' });

export default initI18n;
