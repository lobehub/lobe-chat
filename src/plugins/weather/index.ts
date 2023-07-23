import runner from './runner';

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

const getWeather = { avatar: '☂️', name: 'realtimeWeather', runner, schema };

export default getWeather;
