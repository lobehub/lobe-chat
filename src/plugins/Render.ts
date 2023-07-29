import { PluginRender } from '@/plugins/type';
import getWeather, { WeatherRender } from '@/plugins/weather';

export const PluginsRender: Record<string, PluginRender> = {
  [getWeather.name]: WeatherRender,
};
