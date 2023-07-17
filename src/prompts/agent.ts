import { OpenAIStreamPayload } from '@/types/openai';

// 自动起名
export const promptSummaryAgentName = (content: string): Partial<OpenAIStreamPayload> => ({
  messages: [
    {
      content: `你是一名擅长起名的起名大师，你需要将用户的描述总结为 20 个字以内的角色，格式要求如下：
输入: {文本作为JSON引用字符串}
输出: {角色名}
`,
      role: 'system',
    },
    {
      content: `输入: {你是一名专业的前端开发者，擅长结合 vitest 和\`testing-library/react\` 书写单元测试。接下来用户会输入一串 ts 代码，你需要给出完善的单元测试。\n你需要注意，单元测试代码中，不应该使用 jest 。如果需要使用 \`jest.fn\`，请使用 \`vi.fn\` 替换}`,
      role: 'user',
    },
    { content: '前端 vitest 测试专家', role: 'assistant' },
    {
      content: `输入: {你是一名前端专家，请将下面的代码转成 ts，不要修改实现。如果原本 js 中没有定义的全局变量，需要补充 declare 的类型声明。}`,
      role: 'user',
    },
    { content: 'js 转 ts 专家', role: 'assistant' },
    {
      content: `输入:{你是一名擅长比喻和隐喻的UX Writter。用户会输入文案，你需要给出3个优化后的结果，使用 markdown格式的文本。下面是一个例子：
输入：页面加载中
输出：页面似乎在思考，一会儿才能准备好}`,
      role: 'user',
    },
    { content: '文案比喻优化专家', role: 'assistant' },
    { content: `输入: {${content}}`, role: 'user' },
  ],
});

// 自动挑选 emoji 和背景色
export const promptPickEmoji = (content: string): Partial<OpenAIStreamPayload> => ({
  messages: [
    {
      content: `你是一名非常懂设计与时尚的设计师，你需要从用户的描述中匹配一个合适的 emoji。
输入:你是一名精通体验设计的设计系统设计师，设计系统存在诸多类别的 token，比如品牌色、成功色等，你需要为各个类别的 token 提供说明文案。
输出: 💅

输入:用户会输入一串 ts 代码，为了确保所有功能和分支的 100% 的覆盖率，你需要给出需要考虑哪些数据场景。
输出: 🧪
`,
      role: 'system',
    },
    {
      content: `输入:${content}`,
      role: 'user',
    },
  ],
});

export const promptSummaryDescription = (content: string): Partial<OpenAIStreamPayload> => ({
  messages: [
    {
      content: '你是一名擅长会话的助理，你需要将用户的提示词做一个3句话以内的总结。',
      role: 'system',
    },
    {
      content: `输入:${content}`,
      role: 'user',
    },
  ],
});
