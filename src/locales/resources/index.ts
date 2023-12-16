import de_DE from './de_DE';
import en_US from './en_US';
import es_ES from './es_ES';
import fr_FR from './fr_FR';
import ja_JP from './ja_JP';
import ko_KR from './ko_KR';
import pt_BR from './pt_BR';
import ru_RU from './ru_RU';
import tr_TR from './tr_TR';
import zh_CN from './zh_CN';
import zh_TW from './zh_TW';

const resources = {
  'de-DE': de_DE,
  'en-US': en_US,
  'es-ES': es_ES,
  'fr-FR': fr_FR,
  'ja-JP': ja_JP,
  'ko-KR': ko_KR,
  'pt-BR': pt_BR,
  'ru-RU': ru_RU,
  'tr-TR': tr_TR,
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
} as const;
export default resources;
export const defaultResources = zh_CN;
export type Resources = typeof resources;
export type DefaultResources = typeof defaultResources;
export type Namespaces = keyof DefaultResources;
export type Locales = keyof Resources;
