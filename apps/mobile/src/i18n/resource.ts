import * as Localization from 'expo-localization';

import { DEFAULT_LANG } from '@/_const/locale';

import resources from './default';
import { getSupportedLocales } from './generatedConfig';

// 获取支持的语言列表并转换为 const 类型
export const locales = getSupportedLocales() as readonly string[];

export type DefaultResources = typeof resources;
export type NS = keyof DefaultResources;
export type Locales = (typeof locales)[number];

export type LocaleMode = 'auto' | Locales;

type LanguageDisplayNameMap = Partial<Record<Locales, Partial<Record<Locales, string>>>>;

export const LANGUAGE_FALLBACK_DISPLAY_NAMES: LanguageDisplayNameMap = {
  'ar': {
    'ar': 'العربية',
    'bg-BG': 'البلغارية',
    'de-DE': 'الألمانية',
    'en-US': 'الإنجليزية',
    'es-ES': 'الإسبانية',
    'fa-IR': 'الفارسية',
    'fr-FR': 'الفرنسية',
    'it-IT': 'الإيطالية',
    'ja-JP': 'اليابانية',
    'ko-KR': 'الكورية',
    'nl-NL': 'الهولندية',
    'pl-PL': 'البولندية',
    'pt-BR': 'البرتغالية (البرازيل)',
    'ru-RU': 'الروسية',
    'tr-TR': 'التركية',
    'vi-VN': 'الفيتنامية',
    'zh-CN': 'الصينية المبسطة',
    'zh-TW': 'الصينية التقليدية',
  },
  'bg-BG': {
    'ar': 'арабски',
    'bg-BG': 'български',
    'de-DE': 'немски',
    'en-US': 'английски',
    'es-ES': 'испански',
    'fa-IR': 'персийски',
    'fr-FR': 'френски',
    'it-IT': 'италиански',
    'ja-JP': 'японски',
    'ko-KR': 'корейски',
    'nl-NL': 'нидерландски',
    'pl-PL': 'полски',
    'pt-BR': 'португалски (Бразилия)',
    'ru-RU': 'руски',
    'tr-TR': 'турски',
    'vi-VN': 'виетнамски',
    'zh-CN': 'китайски (опростен)',
    'zh-TW': 'китайски (традиционен)',
  },
  'de-DE': {
    'ar': 'Arabisch',
    'bg-BG': 'Bulgarisch',
    'de-DE': 'Deutsch',
    'en-US': 'Englisch',
    'es-ES': 'Spanisch',
    'fa-IR': 'Persisch',
    'fr-FR': 'Französisch',
    'it-IT': 'Italienisch',
    'ja-JP': 'Japanisch',
    'ko-KR': 'Koreanisch',
    'nl-NL': 'Niederländisch',
    'pl-PL': 'Polnisch',
    'pt-BR': 'Portugiesisch (Brasilien)',
    'ru-RU': 'Russisch',
    'tr-TR': 'Türkisch',
    'vi-VN': 'Vietnamesisch',
    'zh-CN': 'Chinesisch (vereinfacht)',
    'zh-TW': 'Chinesisch (traditionell)',
  },
  'en-US': {
    'ar': 'Arabic',
    'bg-BG': 'Bulgarian',
    'de-DE': 'German',
    'en-US': 'English',
    'es-ES': 'Spanish',
    'fa-IR': 'Persian',
    'fr-FR': 'French',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'nl-NL': 'Dutch',
    'pl-PL': 'Polish',
    'pt-BR': 'Portuguese (Brazil)',
    'ru-RU': 'Russian',
    'tr-TR': 'Turkish',
    'vi-VN': 'Vietnamese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
  },
  'es-ES': {
    'ar': 'árabe',
    'bg-BG': 'búlgaro',
    'de-DE': 'alemán',
    'en-US': 'inglés',
    'es-ES': 'español',
    'fa-IR': 'persa',
    'fr-FR': 'francés',
    'it-IT': 'italiano',
    'ja-JP': 'japonés',
    'ko-KR': 'coreano',
    'nl-NL': 'neerlandés',
    'pl-PL': 'polaco',
    'pt-BR': 'portugués (Brasil)',
    'ru-RU': 'ruso',
    'tr-TR': 'turco',
    'vi-VN': 'vietnamita',
    'zh-CN': 'chino simplificado',
    'zh-TW': 'chino tradicional',
  },
  'fa-IR': {
    'ar': 'عربی',
    'bg-BG': 'بلغاری',
    'de-DE': 'آلمانی',
    'en-US': 'انگلیسی',
    'es-ES': 'اسپانیایی',
    'fa-IR': 'فارسی',
    'fr-FR': 'فرانسوی',
    'it-IT': 'ایتالیایی',
    'ja-JP': 'ژاپنی',
    'ko-KR': 'کره‌ای',
    'nl-NL': 'هلندی',
    'pl-PL': 'لهستانی',
    'pt-BR': 'پرتغالی (برزیل)',
    'ru-RU': 'روسی',
    'tr-TR': 'ترکی استانبولی',
    'vi-VN': 'ویتنامی',
    'zh-CN': 'چینی ساده‌شده',
    'zh-TW': 'چینی سنتی',
  },
  'fr-FR': {
    'ar': 'arabe',
    'bg-BG': 'bulgare',
    'de-DE': 'allemand',
    'en-US': 'anglais',
    'es-ES': 'espagnol',
    'fa-IR': 'persan',
    'fr-FR': 'français',
    'it-IT': 'italien',
    'ja-JP': 'japonais',
    'ko-KR': 'coréen',
    'nl-NL': 'néerlandais',
    'pl-PL': 'polonais',
    'pt-BR': 'portugais (Brésil)',
    'ru-RU': 'russe',
    'tr-TR': 'turc',
    'vi-VN': 'vietnamien',
    'zh-CN': 'chinois simplifié',
    'zh-TW': 'chinois traditionnel',
  },
  'it-IT': {
    'ar': 'arabo',
    'bg-BG': 'bulgaro',
    'de-DE': 'tedesco',
    'en-US': 'inglese',
    'es-ES': 'spagnolo',
    'fa-IR': 'persiano',
    'fr-FR': 'francese',
    'it-IT': 'italiano',
    'ja-JP': 'giapponese',
    'ko-KR': 'coreano',
    'nl-NL': 'olandese',
    'pl-PL': 'polacco',
    'pt-BR': 'portoghese (Brasile)',
    'ru-RU': 'russo',
    'tr-TR': 'turco',
    'vi-VN': 'vietnamita',
    'zh-CN': 'cinese semplificato',
    'zh-TW': 'cinese tradizionale',
  },
  'ja-JP': {
    'ar': 'アラビア語',
    'bg-BG': 'ブルガリア語',
    'de-DE': 'ドイツ語',
    'en-US': '英語',
    'es-ES': 'スペイン語',
    'fa-IR': 'ペルシア語',
    'fr-FR': 'フランス語',
    'it-IT': 'イタリア語',
    'ja-JP': '日本語',
    'ko-KR': '韓国語',
    'nl-NL': 'オランダ語',
    'pl-PL': 'ポーランド語',
    'pt-BR': 'ポルトガル語 (ブラジル)',
    'ru-RU': 'ロシア語',
    'tr-TR': 'トルコ語',
    'vi-VN': 'ベトナム語',
    'zh-CN': '簡体字中国語',
    'zh-TW': '繁体字中国語',
  },
  'ko-KR': {
    'ar': '아랍어',
    'bg-BG': '불가리아어',
    'de-DE': '독일어',
    'en-US': '영어',
    'es-ES': '스페인어',
    'fa-IR': '페르시아어',
    'fr-FR': '프랑스어',
    'it-IT': '이탈리아어',
    'ja-JP': '일본어',
    'ko-KR': '한국어',
    'nl-NL': '네덜란드어',
    'pl-PL': '폴란드어',
    'pt-BR': '포르투갈어(브라질)',
    'ru-RU': '러시아어',
    'tr-TR': '튀르키예어',
    'vi-VN': '베트남어',
    'zh-CN': '중국어(간체)',
    'zh-TW': '중국어(번체)',
  },
  'nl-NL': {
    'ar': 'Arabisch',
    'bg-BG': 'Bulgaars',
    'de-DE': 'Duits',
    'en-US': 'Engels',
    'es-ES': 'Spaans',
    'fa-IR': 'Perzisch',
    'fr-FR': 'Frans',
    'it-IT': 'Italiaans',
    'ja-JP': 'Japans',
    'ko-KR': 'Koreaans',
    'nl-NL': 'Nederlands',
    'pl-PL': 'Pools',
    'pt-BR': 'Portugees (Brazilië)',
    'ru-RU': 'Russisch',
    'tr-TR': 'Turks',
    'vi-VN': 'Vietnamees',
    'zh-CN': 'Chinees (vereenvoudigd)',
    'zh-TW': 'Chinees (traditioneel)',
  },
  'pl-PL': {
    'ar': 'arabski',
    'bg-BG': 'bułgarski',
    'de-DE': 'niemiecki',
    'en-US': 'angielski',
    'es-ES': 'hiszpański',
    'fa-IR': 'perski',
    'fr-FR': 'francuski',
    'it-IT': 'włoski',
    'ja-JP': 'japoński',
    'ko-KR': 'koreański',
    'nl-NL': 'niderlandzki',
    'pl-PL': 'polski',
    'pt-BR': 'portugalski (Brazylia)',
    'ru-RU': 'rosyjski',
    'tr-TR': 'turecki',
    'vi-VN': 'wietnamski',
    'zh-CN': 'chiński uproszczony',
    'zh-TW': 'chiński tradycyjny',
  },
  'pt-BR': {
    'ar': 'árabe',
    'bg-BG': 'búlgaro',
    'de-DE': 'alemão',
    'en-US': 'inglês',
    'es-ES': 'espanhol',
    'fa-IR': 'persa',
    'fr-FR': 'francês',
    'it-IT': 'italiano',
    'ja-JP': 'japonês',
    'ko-KR': 'coreano',
    'nl-NL': 'holandês',
    'pl-PL': 'polonês',
    'pt-BR': 'português (Brasil)',
    'ru-RU': 'russo',
    'tr-TR': 'turco',
    'vi-VN': 'vietnamita',
    'zh-CN': 'chinês simplificado',
    'zh-TW': 'chinês tradicional',
  },
  'ru-RU': {
    'ar': 'арабский',
    'bg-BG': 'болгарский',
    'de-DE': 'немецкий',
    'en-US': 'английский',
    'es-ES': 'испанский',
    'fa-IR': 'персидский',
    'fr-FR': 'французский',
    'it-IT': 'итальянский',
    'ja-JP': 'японский',
    'ko-KR': 'корейский',
    'nl-NL': 'нидерландский',
    'pl-PL': 'польский',
    'pt-BR': 'португальский (Бразилия)',
    'ru-RU': 'русский',
    'tr-TR': 'турецкий',
    'vi-VN': 'вьетнамский',
    'zh-CN': 'китайский (упрощенный)',
    'zh-TW': 'китайский (традиционный)',
  },
  'tr-TR': {
    'ar': 'Arapça',
    'bg-BG': 'Bulgarca',
    'de-DE': 'Almanca',
    'en-US': 'İngilizce',
    'es-ES': 'İspanyolca',
    'fa-IR': 'Farsça',
    'fr-FR': 'Fransızca',
    'it-IT': 'İtalyanca',
    'ja-JP': 'Japonca',
    'ko-KR': 'Korece',
    'nl-NL': 'Felemenkçe',
    'pl-PL': 'Lehçe',
    'pt-BR': 'Portekizce (Brezilya)',
    'ru-RU': 'Rusça',
    'tr-TR': 'Türkçe',
    'vi-VN': 'Vietnamca',
    'zh-CN': 'Çince (Basitleştirilmiş)',
    'zh-TW': 'Çince (Geleneksel)',
  },
  'vi-VN': {
    'ar': 'Tiếng Ả Rập',
    'bg-BG': 'Tiếng Bulgaria',
    'de-DE': 'Tiếng Đức',
    'en-US': 'Tiếng Anh',
    'es-ES': 'Tiếng Tây Ban Nha',
    'fa-IR': 'Tiếng Ba Tư',
    'fr-FR': 'Tiếng Pháp',
    'it-IT': 'Tiếng Italy',
    'ja-JP': 'Tiếng Nhật',
    'ko-KR': 'Tiếng Hàn',
    'nl-NL': 'Tiếng Hà Lan',
    'pl-PL': 'Tiếng Ba Lan',
    'pt-BR': 'Tiếng Bồ Đào Nha (Brazil)',
    'ru-RU': 'Tiếng Nga',
    'tr-TR': 'Tiếng Thổ Nhĩ Kỳ',
    'vi-VN': 'Tiếng Việt',
    'zh-CN': 'Tiếng Trung giản thể',
    'zh-TW': 'Tiếng Trung phồn thể',
  },
  'zh-CN': {
    'ar': '阿拉伯语',
    'bg-BG': '保加利亚语',
    'de-DE': '德语',
    'en-US': '英语',
    'es-ES': '西班牙语',
    'fa-IR': '波斯语',
    'fr-FR': '法语',
    'it-IT': '意大利语',
    'ja-JP': '日语',
    'ko-KR': '韩语',
    'nl-NL': '荷兰语',
    'pl-PL': '波兰语',
    'pt-BR': '葡萄牙语（巴西）',
    'ru-RU': '俄语',
    'tr-TR': '土耳其语',
    'vi-VN': '越南语',
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
  },
  'zh-TW': {
    'ar': '阿拉伯文',
    'bg-BG': '保加利亞文',
    'de-DE': '德文',
    'en-US': '英文',
    'es-ES': '西班牙文',
    'fa-IR': '波斯文',
    'fr-FR': '法文',
    'it-IT': '義大利文',
    'ja-JP': '日文',
    'ko-KR': '韓文',
    'nl-NL': '荷蘭文',
    'pl-PL': '波蘭文',
    'pt-BR': '葡萄牙文（巴西）',
    'ru-RU': '俄文',
    'tr-TR': '土耳其文',
    'vi-VN': '越南文',
    'zh-CN': '簡體中文',
    'zh-TW': '繁體中文',
  },
} as const;

export const LANGUAGE_FALLBACK_NAMES: Record<Locales, string> = LANGUAGE_FALLBACK_DISPLAY_NAMES[
  'en-US'
] as Record<Locales, string>;

export const normalizeLocale = (locale: string) => {
  if (!locale) return DEFAULT_LANG;

  // 处理 React Native 特有的语言格式
  const normalizedLocale = locale.replace('_', '-');

  // 特殊语言处理
  if (normalizedLocale.startsWith('ar')) return 'ar';
  if (normalizedLocale.startsWith('fa')) return 'fa-IR';
  if (normalizedLocale.startsWith('cn')) return 'zh-CN';

  // 英文变体统一映射到 en-US
  if (normalizedLocale.startsWith('en')) return 'en-US';

  // 中文变体统一映射到 zh-CN
  if (normalizedLocale.startsWith('zh')) return 'zh-CN';

  // 其他语言的精确匹配
  for (const l of locales) {
    if (l.startsWith(normalizedLocale) || normalizedLocale.startsWith(l)) {
      return l;
    }
  }

  return DEFAULT_LANG;
};

export const getDetectedLocale = (): string => {
  const locale = Localization.getLocales()[0].languageTag;

  return normalizeLocale(locale);
};

type LocaleOptions = {
  label: string;
  value: Locales;
}[];

export const LANGUAGE_OPTIONS: LocaleOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '简体中文',
    value: 'zh-CN',
  },
  {
    label: '繁體中文',
    value: 'zh-TW',
  },
  {
    label: '日本語',
    value: 'ja-JP',
  },
  {
    label: '한국어',
    value: 'ko-KR',
  },
  {
    label: 'Deutsch',
    value: 'de-DE',
  },
  {
    label: 'Español',
    value: 'es-ES',
  },
  {
    label: 'العربية',
    value: 'ar',
  },
  {
    label: 'Français',
    value: 'fr-FR',
  },
  {
    label: 'Português',
    value: 'pt-BR',
  },
  {
    label: 'Русский',
    value: 'ru-RU',
  },
  {
    label: 'Türkçe',
    value: 'tr-TR',
  },
  {
    label: 'Polski',
    value: 'pl-PL',
  },
  {
    label: 'Nederlands',
    value: 'nl-NL',
  },
  {
    label: 'Italiano',
    value: 'it-IT',
  },
  {
    label: 'Tiếng Việt',
    value: 'vi-VN',
  },
  {
    label: 'Български',
    value: 'bg-BG',
  },
  {
    label: 'فارسی',
    value: 'fa-IR',
  },
] as LocaleOptions;

export const supportLocales: string[] = [...locales, 'en', 'zh'];
