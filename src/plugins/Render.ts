import { PluginRender } from '@/plugins/type';

import getWeather from './weather';
import WeatherRender from './weather/Render';

export const PluginsRender: Record<string, PluginRender> = {
  [getWeather.name]: WeatherRender,
};
