import { PluginRender } from '@/plugins/type';

import searchEngine from './searchEngine';
import SearchEngineRender from './searchEngine/Render';
import getWeather from './weather';
import WeatherRender from './weather/Render';

export const PluginsRender: Record<string, PluginRender> = {
  [getWeather.name]: WeatherRender,
  [searchEngine.name]: SearchEngineRender,
};
