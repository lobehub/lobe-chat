import { changeLanguage } from 'i18next';

export const switchLang = (lang: string) => {
  changeLanguage(lang);
  document.documentElement.lang = lang;
};
