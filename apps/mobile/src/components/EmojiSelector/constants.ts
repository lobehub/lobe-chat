import emoji from 'emoji-datasource';

import type { EmojiObject } from './type';

/**
 * Emoji 分类常量
 */
export const Categories = {
  activities: {
    name: 'Activities',
    symbol: '⚾️',
  },
  emotion: {
    name: 'Smileys & Emotion',
    symbol: '😀',
  },
  food: {
    name: 'Food & Drink',
    symbol: '🍔',
  },
  nature: {
    name: 'Animals & Nature',
    symbol: '🦄',
  },
  objects: {
    name: 'Objects',
    symbol: '💡',
  },
  people: {
    name: 'People & Body',
    symbol: '🧑',
  },
  places: {
    name: 'Travel & Places',
    symbol: '✈️',
  },
  symbols: {
    name: 'Symbols',
    symbol: '🔣',
  },
};

/**
 * 分类 keys
 */
export const categoryKeys = Object.keys(Categories);

/**
 * 过滤后的 emoji 列表（移除废弃的）
 */
export const filteredEmojis = emoji.filter((e: any) => !e.obsoleted_by);

/**
 * UTF-16 转字符
 */
export const charFromUtf16 = (utf16: string): string =>
  String.fromCodePoint(...utf16.split('-').map((u) => parseInt(`0x${u}`, 16)));

/**
 * Emoji 对象转字符
 */
export const charFromEmojiObject = (obj: EmojiObject): string => charFromUtf16(obj.unified);

/**
 * 根据分类获取 emoji 列表
 */
export const emojiByCategory = (category: string) =>
  filteredEmojis.filter((e: any) => e.category === category);

/**
 * 排序 emoji 列表
 */
export const sortEmoji = (list: EmojiObject[]) => list.sort((a, b) => a.sort_order - b.sort_order);
