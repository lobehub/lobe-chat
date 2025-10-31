import dayjs from 'dayjs';
// React Native 需要静态导入所有 locale，不支持动态 import
import 'dayjs/locale/ar';
import 'dayjs/locale/bg';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/es';
import 'dayjs/locale/fa';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/nl';
import 'dayjs/locale/pl';
import 'dayjs/locale/pt-br';
import 'dayjs/locale/ru';
import 'dayjs/locale/tr';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

/**
 * dayjs locale 映射
 * 将应用的语言代码映射到 dayjs 的 locale 名称
 */
const DAYJS_LOCALE_MAP: Record<string, string> = {
  'ar': 'ar',
  'bg-BG': 'bg',
  'de-DE': 'de',
  'en-US': 'en',
  'es-ES': 'es',
  'fa-IR': 'fa',
  'fr-FR': 'fr',
  'it-IT': 'it',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'nl-NL': 'nl',
  'pl-PL': 'pl',
  'pt-BR': 'pt-br',
  'ru-RU': 'ru',
  'tr-TR': 'tr',
  'vi-VN': 'vi',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
};

/**
 * 更新 dayjs 的 locale
 * 根据 i18n 的语言设置切换对应的 dayjs locale
 */
export const updateDayjsLocale = (lang: string): void => {
  try {
    // 获取 dayjs locale 名称
    const dayjsLocale = DAYJS_LOCALE_MAP[lang] || 'en';

    // 设置 dayjs locale
    dayjs.locale(dayjsLocale);

    console.log(`✅ dayjs locale set to: ${dayjsLocale} (from ${lang})`);
  } catch (error) {
    console.error('[dayjs] Failed to update locale:', error);
    // 确保至少设置为英文
    dayjs.locale('en');
  }
};

/**
 * 获取当前 dayjs locale
 */
export const getCurrentDayjsLocale = (): string => {
  return dayjs.locale();
};
