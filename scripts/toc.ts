import { genDefaultLocale } from './genDefaultLocale';
import { genResources } from './genResources';

const RES_OUTPUT = 'src/locales/resources';

genDefaultLocale(RES_OUTPUT);
genResources(RES_OUTPUT);
