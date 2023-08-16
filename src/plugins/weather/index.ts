import { PluginItem } from '@/plugins/type';

const schema = {
  description: '获取当前天气情况',
  name: 'realtimeWeather',
  parameters: {
    properties: {
      city: {
        description: '城市名称',
        type: 'string',
      },
    },
    required: ['city'],
    type: 'object',
  },
};

const getWeather: PluginItem = {
  avatar: '☂️',
  name: 'realtimeWeather',
  schema,
};

export default getWeather;
