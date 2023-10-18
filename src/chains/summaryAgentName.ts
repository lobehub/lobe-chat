import { OpenAIChatStreamPayload } from '@/types/openai/chat';

/**
 * summary agent name for user prompt
 * @param content
 */
export const chainSummaryAgentName = (content: string): Partial<OpenAIChatStreamPayload> => ({
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
