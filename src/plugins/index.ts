import searchEngine from '@/plugins/searchEngine';

import getWeather from './weather';

export const plugins = [getWeather, searchEngine];
