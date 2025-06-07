import { template } from 'lodash-es';

import { uuid } from '@/utils/uuid';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { getAgentStoreState } from '@/store/agent/store';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const placeholderVariablesRegex = /{{(.*?)}}/g;

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const VARIABLE_GENERATORS = {
  /**
  * 时间类模板变量
  *
  * | Value | Example |
  * |-------|---------|
  * | `{{date}}` | 12/25/2023 |
  * | `{{datetime}}` | 12/25/2023, 2:30:45 PM |
  * | `{{day}}` | 25 |
  * | `{{hour}}` | 14 |
  * | `{{iso}}` | 2023-12-25T14:30:45.123Z |
  * | `{{locale}}` | zh-CN |
  * | `{{minute}}` | 30 |
  * | `{{month}}` | 12 |
  * | `{{second}}` | 45 |
  * | `{{time}}` | 2:30:45 PM |
  * | `{{timestamp}}` | 1703538645123 |
  * | `{{timezone}}` | America/New_York |
  * | `{{weekday}}` | Monday |
  * | `{{year}}` | 2023 |
  *
  */
  date: () => new Date().toLocaleDateString(),
  datetime: () => new Date().toLocaleString(),
  day: () => new Date().getDate().toString().padStart(2, '0'),
  hour: () => new Date().getHours().toString().padStart(2, '0'),
  iso: () => new Date().toISOString(),
  locale: () => Intl.DateTimeFormat().resolvedOptions().locale,
  minute: () => new Date().getMinutes().toString().padStart(2, '0'),
  month: () => (new Date().getMonth() + 1).toString().padStart(2, '0'),
  second: () => new Date().getSeconds().toString().padStart(2, '0'),
  time: () => new Date().toLocaleTimeString(),
  timestamp: () => Date.now().toString(),
  timezone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  weekday: () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  year: () => new Date().getFullYear().toString(),

  /**
  * 用户信息类模板变量
  *
  * | Value | Example |
  * |-------|---------|
  * | `{{email}}` | demo@lobehub.com |
  * | `{{nickname}}` | 社区版用户 |
  * | `{{username}}` | LobeChat |
  *
  */
  email: () => userProfileSelectors.email(useUserStore.getState()) ?? '',
  nickname: () => userProfileSelectors.nickName(useUserStore.getState()) ?? '',
  username: () => userProfileSelectors.displayUserName(useUserStore.getState()) ?? userProfileSelectors.fullName(useUserStore.getState()) ?? '',

  /**
  * 随机值类模板变量
  *
  * | Value | Example |
  * |-------|---------|
  * | `{{random}}` | 100041 |
  * | `{{random_bool}}` | true |
  * | `{{random_float}}` | 76.02 |
  * | `{{random_hex}}` | de0dbd |
  * | `{{random_int}}` | 68 |
  * | `{{random_string}}` | wqn9zfrqe7h |
  *
  */
  random: () => Math.floor(Math.random() * 1_000_000 + 1).toString(),
  random_bool: () => (Math.random() > 0.5 ? 'true' : 'false'),
  random_float: () => (Math.random() * 100).toFixed(2),
  random_hex: () => Math.floor(Math.random() * 16_777_215).toString(16).padStart(6, '0'),
  random_int: () => Math.floor(Math.random() * 100 + 1).toString(),
  random_string: () => Math.random().toString(36).slice(2, 15),
  random_digit: () => Math.floor(Math.random() * 10).toString(),

  /**
  * UUID 类模板变量
  *
  * | Value | Example |
  * |-------|---------|
  * | `{{uuid}}` | dd90b35-669f-4e87-beb8-ac6877f6995d |
  * | `{{uuid_short}}` | dd90b35 |
  *
  */
  uuid: () => uuid(),
  uuid_short: () => uuid().split('-')[0],

  /**
  * 平台类模板变量
  *
  * | Value | Example |
  * |-------|---------|
  * | `{{language}}` | zh-CN |
  * | `{{platform}}` | MacIntel |
  * | `{{user_agent}}` | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0 |
  *
  */
  language: () => typeof navigator !== 'undefined' ? navigator.language : '',
  platform: () => typeof navigator !== 'undefined' ? navigator.platform : '',
  user_agent: () => typeof navigator !== 'undefined' ? navigator.userAgent : '',

  /**
  * LobeChat 模板变量
  *
  * | Value | Example |
  * |-------|---------|
  * | `{{input_template}}` | Some contents |
  *
  */
  input_template: () => agentChatConfigSelectors.currentChatConfig(getAgentStoreState()).inputTemplate || '',
} as Record<string, () => string>;

/**
 * 从文本中提取所有 {{variable}} 占位符的变量名
 * @param text 包含模板变量的字符串
 * @returns 变量名数组，如 ['date', 'nickname']
 */
const extractPlaceholderVariables = (text: string): string[] => {
  const matches = [...text.matchAll(placeholderVariablesRegex)];
  return matches.map(m => m[1].trim());
};

/**
 * 将模板变量替换为实际值，并支持递归解析嵌套变量
 * @param text - 含变量的原始文本
 * @param depth - 递归深度，默认 1，设置更高可支持 {{input_template}} 中的 {{date}} 等
 * @returns 替换后的文本
 */
export const parsePlaceholderVariables = (text: string, depth = 2): string => {
  let result = text;

  // 递归解析，用于处理如 {{input_template}} 存在额外预设变量
  for (let i = 0; i < depth; i++) {
    try {
      const variables = Object.fromEntries(
        extractPlaceholderVariables(result)
          .map((key) => [key, VARIABLE_GENERATORS[key]?.()])
          .filter(([, value]) => value !== undefined)
      );

      const replaced = template(result, { interpolate: placeholderVariablesRegex })(variables);
      if (replaced === result) break;

      result = replaced;
    } catch {
      break;
    }
  }

  return result;
};

/**
 * 解析消息内容，替换占位符变量
 * @param messages 原始消息数组
 * @returns 处理后的消息数组
 */
export const parsePlaceholderVariablesMessages = (messages: any[]): any[] =>
  messages.map(message => {
    if (!message?.content) return message;

    const { content } = message;

    // 字符串类型直接处理
    if (typeof content === 'string') {
      return { ...message, content: parsePlaceholderVariables(content) };
    }

    // 数组类型处理其中的 text 元素
    if (Array.isArray(content)) {
      return {
        ...message,
        content: content.map(item => 
          item?.type === 'text' 
            ? { ...item, text: parsePlaceholderVariables(item.text) }
            : item
        )
      };
    }

    return message;
  });
