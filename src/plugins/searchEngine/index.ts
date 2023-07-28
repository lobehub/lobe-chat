import { ChatCompletionFunctions } from 'openai-edge/types/api';

import { PluginItem } from '@/plugins/type';

import runner from './runner';
import { Result } from './type';

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

const searchEngine: PluginItem<Result> = {
  avatar: '🔍',
  name: 'searchEngine',
  runner,
  schema,
};

export default searchEngine;
