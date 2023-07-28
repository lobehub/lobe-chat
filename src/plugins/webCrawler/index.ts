import { PluginItem } from '@/plugins/type';

import runner from './runner';
import { Result } from './type';

const schema = {
  description: '提取网页内容并总结',
  name: 'websiteCrawler',
  parameters: {
    properties: {
      url: {
        description: '网页内容',
        type: 'string',
      },
    },
    required: ['url'],
    type: 'object',
  },
};

const getWeather: PluginItem<Result> = { avatar: '🕸', name: 'websiteCrawler', runner, schema };

export default getWeather;
