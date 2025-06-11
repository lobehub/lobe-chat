import { genDefaultLocale } from './genDefaultLocale';
import { genRemoveDiff } from './genRemoveDiff';
import { split } from './utils';

split('DIFF ANALYSIS');
genRemoveDiff();

split('GENERATE DEFAULT LOCALE');
genDefaultLocale();

split('GENERATE I18N FILES');
