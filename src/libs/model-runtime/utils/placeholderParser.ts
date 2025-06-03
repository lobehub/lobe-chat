import { v4 as uuidv4 } from 'uuid';

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
 * | `{{random_hex}}` | de0dbd |
 * | `{{random_int}}` | 68 |
 * | `{{random}}` | 100041 |
 * | `{{second}}` | 45 |
 * | `{{time}}` | 2:30:45 PM |
 * | `{{timestamp}}` | 1703538645123 |
 * | `{{timezone}}` | America/New_York |
 * | `{{uuid}}` | dd90b35-669f-4e87-beb8-ac6877f6995d |
 * | `{{weekday}}` | Monday |
 * | `{{year}}` | 2023 |
 * 
 * @param text - 包含模板变量的文本
 * @returns 替换后的文本
 */
export const parsePlaceholderVariables = (text: string): string => {
  const now = new Date();

  const variables: Record<string, string> = {
    date: now.toLocaleDateString(),
    datetime: now.toLocaleString(),
    day: now.getDate().toString().padStart(2, '0'),
    hour: now.getHours().toString().padStart(2, '0'),
    iso: now.toISOString(),
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    minute: now.getMinutes().toString().padStart(2, '0'),
    month: (now.getMonth() + 1).toString().padStart(2, '0'),
    random: Math.floor(Math.random() * 1_000_000 + 1).toString(),
    random_hex: Math.floor(Math.random() * 16_777_215).toString(16).padStart(6, '0'),
    random_int: Math.floor(Math.random() * 100 + 1).toString(),
    second: now.getSeconds().toString().padStart(2, '0'),
    time: now.toLocaleTimeString(),
    timestamp: Date.now().toString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    uuid: uuidv4(),
    weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
    year: now.getFullYear().toString(),
  };

  return text.replaceAll(/{{(\w+)}}/g, (match, key) => {
    return variables[key] || match;
  });
};
