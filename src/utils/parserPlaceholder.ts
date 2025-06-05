import { template } from 'lodash-es';

import { v4 as uuidv4 } from 'uuid';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

/**
 * 获取时间相关的模板变量
 * @returns 包含时间相关预留值的对象
 * 支持的预留值:
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
const getTimeVariables = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString(),
    datetime: now.toLocaleString(),
    day: now.getDate().toString().padStart(2, '0'),
    hour: now.getHours().toString().padStart(2, '0'),
    iso: now.toISOString(),
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    minute: now.getMinutes().toString().padStart(2, '0'),
    month: (now.getMonth() + 1).toString().padStart(2, '0'),
    second: now.getSeconds().toString().padStart(2, '0'),
    time: now.toLocaleTimeString(),
    timestamp: Date.now().toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    year: now.getFullYear().toString(),
  };
};

/**
 * 获取用户信息相关的模板变量
 * @returns 包含用户信息相关预留值的对象
 *
 * | Value | Example |
 * |-------|---------|
 * | `{{nickname}}` | 社区版用户 |
 * | `{{username}}` | LobeChat |
 *
 */
const getUserInfoVariables = () => {
  const userState = useUserStore.getState();
  return {
    nickname: userProfileSelectors.nickName(userState) ?? '',
    username: userProfileSelectors.username(userState) ?? '',
  };
};

/**
 * 获取随机值和其他工具类模板变量
 * @returns 包含随机值和其他工具类预留值的对象
 *
 * | Value | Example |
 * |-------|---------|
 * | `{{random_hex}}` | de0dbd |
 * | `{{random_int}}` | 68 |
 * | `{{random}}` | 100041 |
 * | `{{uuid}}` | dd90b35-669f-4e87-beb8-ac6877f6995d |
 *
 */
const getUtilityVariables = () => {
  return {
    random: Math.floor(Math.random() * 1_000_000 + 1).toString(),
    random_hex: Math.floor(Math.random() * 16_777_215).toString(16).padStart(6, '0'),
    random_int: Math.floor(Math.random() * 100 + 1).toString(),
    uuid: uuidv4(),
  };
};

/**
 * 获取所有模板变量对象
 * @returns 包含所有预留值的对象
 */
const getTemplateVariables = () => {
  return {
    ...getTimeVariables(),
    ...getUserInfoVariables(),
    ...getUtilityVariables(),
  };
};

/**
 * 预留值解析函数 - 将模板变量替换为实际值
 * @param text - 包含模板变量的文本
 * @returns 替换后的文本
 */
export const parsePlaceholderVariables = (text: string): string => {
  try {
    // 使用 lodash template，自定义插值语法为 {{}}
    const compiled = template(text, {
      interpolate: /{{(.*?)}}/g,
    });

    return compiled(getTemplateVariables());
  } catch (error) {
    // 如果模板编译失败，返回原文本
    return text;
  }
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
