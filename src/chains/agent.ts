import { OpenAIChatStreamPayload } from '@/types/openai/chat';

// 自动起名
export const promptSummaryAgentName = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content: `你是一名擅长起名的起名大师，名字需要有文学内涵，注重精炼和赋子意境，你需要将用户的描述总结为 20 个字以内的角色, 格式要求如下：\n输入: {文本作为JSON引用字符串}\n输出: {角色名}`,
      role: 'system',
    },
    {
      content: `输入: {你是一名文案大师，帮我为一些设计 / 艺术作品起名，名字需要有文学内涵，注重精炼和赋子意境，表达作品的情景氛国，使名称既简洁又富有诗意。}`,
      role: 'user',
    },
    { content: '创意命名师', role: 'assistant' },
    {
      content: `输入: {你是一名前端代码专家，请将下面的代码转成 ts，不要修改实现。如果原本 js 中没有定义的全局变量，需要补充 declare 的类型声明。}`,
      role: 'user',
    },
    { content: 'ts转换魔术师', role: 'assistant' },
    {
      content: `输入: {你是一名创业计划撰写专家，可以提供包括创意名称、简短的标语、目标用户画像、用户痛点、主要价值主张、销售/营销渠道、收入流、成本结构等计划生成。}`,
      role: 'user',
    },
    { content: '创业咨询专家', role: 'assistant' },
    { content: `输入: {${content}}`, role: 'user' },
  ],
});

// 自动挑选 emoji 和背景色
export const promptPickEmoji = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content:
        '你是一名擅长进行概念抽象的设计师与 Emoji 专家，你需要根据角色能力的描述抽象出一个表达物理实体的概念 Emoji 作为角色头像, 格式要求如下：\n输入: {文本作为JSON引用字符串}\n输出: {一个Emoji}',
      role: 'system',
    },
    {
      content: `输入: {你是一名文案大师，帮我为一些设计 / 艺术作品起名，名字需要有文学内涵，注重精炼和赋子意境，表达作品的情景氛国，使名称既简洁又富有诗意。}`,
      role: 'user',
    },
    { content: '✒️', role: 'assistant' },
    {
      content: `输入: {你是一名代码巫师，请将下面的代码转成 ts，不要修改实现。如果原本 js 中没有定义的全局变量，需要补充 declare 的类型声明。}`,
      role: 'user',
    },
    { content: '🧙‍♂️', role: 'assistant' },
    {
      content: `输入: {你是一名创业计划撰写专家，可以提供包括创意名称、简短的标语、目标用户画像、用户痛点、主要价值主张、销售/营销渠道、收入流、成本结构等计划生成。}`,
      role: 'user',
    },
    { content: '🚀', role: 'assistant' },
    { content: `输入: {${content}}`, role: 'user' },
  ],
});

export const promptSummaryDescription = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content: `你是一名擅长技能总结的助理，你需要将用户的输入的内容总结为一个角色技能简介，确保信息清晰、逻辑清晰，并有效地传达角色的技能和经验，不超过 20 个字, 格式要求如下：\n输入: {文本作为JSON引用字符串}\n输出: {角色技能简介}`,
      role: 'system',
    },
    {
      content: `输入: {你是一名文案大师，帮我为一些设计 / 艺术作品起名，名字需要有文学内涵，注重精炼和赋子意境，表达作品的情景氛国，使名称既简洁又富有诗意。}`,
      role: 'user',
    },
    { content: '擅长文创艺术作品起名', role: 'assistant' },
    {
      content: `输入: {你是一名前端代码专家，请将下面的代码转成 ts，不要修改实现。如果原本 js 中没有定义的全局变量，需要补充 declare 的类型声明。}`,
      role: 'user',
    },
    { content: '擅长 ts 转换和补充类型声明', role: 'assistant' },
    {
      content: `输入: {你是一名创业计划撰写专家，可以提供包括创意名称、简短的标语、目标用户画像、用户痛点、主要价值主张、销售/营销渠道、收入流、成本结构等计划生成。}`,
      role: 'user',
    },
    { content: '擅长创业计划撰写与咨询', role: 'assistant' },
    { content: `输入: {${content}}`, role: 'user' },
  ],
});

export const promptSummaryTags = (content: string): Partial<OpenAIChatStreamPayload> => ({
  messages: [
    {
      content:
        '你是一名擅长会话标签总结的助理，你需要将用户的输入的内容提炼出分类标签，使用`,`分隔，不超过 5 个标签, 格式要求如下：\n输入: {文本作为JSON引用字符串}\n输出: {角色名}',
      role: 'system',
    },
    {
      content: `输入: {你是一名文案大师，帮我为一些设计 / 艺术作品起名，名字需要有文学内涵，注重精炼和赋子意境，表达作品的情景氛国，使名称既简洁又富有诗意。}`,
      role: 'user',
    },
    { content: '起名,写作,创意', role: 'assistant' },
    {
      content: `输入: {你是一名前端专家，请将下面的代码转成 ts，不要修改实现。如果原本 js 中没有定义的全局变量，需要补充 declare 的类型声明。}`,
      role: 'user',
    },
    { content: '代码,软件开发,效率', role: 'assistant' },
    {
      content: `输入: {你是一名创业计划撰写专家，可以提供包括创意名称、简短的标语、目标用户画像、用户痛点、主要价值主张、销售/营销渠道、收入流、成本结构等计划生成。}`,
      role: 'user',
    },
    { content: '创业,计划,咨询', role: 'assistant' },
    { content: `输入: {${content}}`, role: 'user' },
  ],
});
