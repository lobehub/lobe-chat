import type { PluginItem, PluginRender } from '@/plugins/type';

import searchEngine from './searchEngine';
import getWeather, { WeatherRender } from './weather';
import webCrawler from './webCrawler';

export const PluginsMap: Record<string, PluginItem> = {
  [getWeather.name]: getWeather,
  [searchEngine.name]: searchEngine,
  [webCrawler.name]: webCrawler,
};

export const PluginsRender: Record<string, PluginRender> = {
  [getWeather.name]: WeatherRender,
};
