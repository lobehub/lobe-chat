import { ChatCompletionFunctions } from 'openai-edge/types/api';

import runner from './runner';

const schema: ChatCompletionFunctions = {
  description: '查询搜索引擎获取信息',
  name: 'searchEngine',
  parameters: {
    properties: {
      keywords: {
        description: '关键词',
        type: 'string',
      },
    },
    required: ['keywords'],
    type: 'object',
  },
};

const searchEngine = {
  avatar: '🔍',
  name: 'searchEngine',
  runner,
  schema,
};

export default searchEngine;
