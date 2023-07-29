import type { PluginItem } from '@/plugins/type';

import searchEngine from './searchEngine';
import getWeather from './weather';
import webCrawler from './webCrawler';

export const PluginsMap: Record<string, PluginItem> = {
  [getWeather.name]: getWeather,
  [searchEngine.name]: searchEngine,
  [webCrawler.name]: webCrawler,
};
