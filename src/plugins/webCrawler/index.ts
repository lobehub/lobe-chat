import runner from './runner';

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

const getWeather = { avatar: '🕸', name: 'websiteCrawler', runner, schema };

export default getWeather;
