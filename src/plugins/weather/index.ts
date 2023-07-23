import runner from './runner';

const schema = {
  description: '获取当前天气情况',
  name: 'fetchWeather',
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

const getWeather = { name: 'fetchWeather', runner, schema };

export default getWeather;
