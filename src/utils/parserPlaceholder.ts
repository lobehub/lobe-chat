import { v4 as uuidv4 } from 'uuid';
import { template } from 'lodash-es';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

/**
 * 获取模板变量对象
 * @returns 包含所有预留值的对象
 */
const getTemplateVariables = () => {
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
    nickname: userProfileSelectors.nickName(useUserStore.getState()) ?? '',
    random: Math.floor(Math.random() * 1_000_000 + 1).toString(),
    random_hex: Math.floor(Math.random() * 16_777_215).toString(16).padStart(6, '0'),
    random_int: Math.floor(Math.random() * 100 + 1).toString(),
    second: now.getSeconds().toString().padStart(2, '0'),
    time: now.toLocaleTimeString(),
    timestamp: Date.now().toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    username: userProfileSelectors.username(useUserStore.getState()) ?? '',
    uuid: uuidv4(),
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    year: now.getFullYear().toString(),
  };
};

/**
 * 预留值解析函数 - 将模板变量替换为实际值
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
 * | `{{nickname}}` | 社区版用户 |
 * | `{{random_hex}}` | de0dbd |
 * | `{{random_int}}` | 68 |
 * | `{{random}}` | 100041 |
 * | `{{second}}` | 45 |
 * | `{{time}}` | 2:30:45 PM |
 * | `{{timestamp}}` | 1703538645123 |
 * | `{{timezone}}` | America/New_York |
 * | `{{username}}` | LobeChat |
 * | `{{uuid}}` | dd90b35-669f-4e87-beb8-ac6877f6995d |
 * | `{{weekday}}` | Monday |
 * | `{{year}}` | 2023 |
 * 
 * @param text - 包含模板变量的文本
 * @returns 替换后的文本
 */
export const parsePlaceholderVariables = (text: string): string => {
  try {
    // 使用 lodash template，自定义插值语法为 {{}}
    const compiled = template(text, {
      interpolate: /{{([\s\S]+?)}}/g
    });
    
    return compiled(getTemplateVariables());
  } catch (error) {
    // 如果模板编译失败，返回原文本
    console.warn('Template parsing failed:', error);
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
    // 检查 message 是否具有 content 属性
    if (!Object.prototype.hasOwnProperty.call(message, 'content')) {
      return message;
    }

    const content = message.content;

    // 处理字符串类型的 content
    if (typeof content === 'string') {
      return {
        ...message,
        content: parsePlaceholderVariables(content)
      };
    }

    // 处理数组类型的 content（如混合 text 和 image_url）
    if (Array.isArray(content)) {
      return {
        ...message,
        content: content.map(item => {
          // 仅对 type 为 text 的元素进行处理
          if (item && typeof item === 'object' && item.type === 'text') {
            return {
              ...item,
              text: parsePlaceholderVariables(item.text)
            };
          }
          // 非 text 类型保持原样返回
          return item;
        })
      };
    }

    // 非字符串、非数组的 content 原样返回
    return message;
  });
