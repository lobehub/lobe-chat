import { genDefaultLocale } from './genDefaultLocale';
import { genDiff } from './genDiff';
import { genResources } from './genResources';
import { split } from './utils';

split('DIFF ANALYSIS');
genDiff();

split('GENERATE DEFAULT LOCALE');
genDefaultLocale();

split('GENERATE RESOURCE & TOC');
genResources();

split('GENERATE I18N FILES');
