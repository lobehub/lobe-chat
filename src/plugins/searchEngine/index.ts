import { ChatCompletionFunctions } from 'openai-edge/types/api';

import { PluginItem } from '@/plugins/type';

import render from './Render';

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

const searchEngine: PluginItem = {
  avatar: '🔍',
  name: 'searchEngine',
  render,
  schema,
};

export default searchEngine;
