import { UserStore } from '../../../store';
import { currentSettings } from './settings';

const generalConfig = (s: UserStore) => currentSettings(s).general || {};

const currentThemeMode = (s: UserStore) => {
  const themeMode = generalConfig(s).themeMode;
  return themeMode || 'auto';
};

const neutralColor = (s: UserStore) => generalConfig(s).neutralColor;
const primaryColor = (s: UserStore) => generalConfig(s).primaryColor;
const fontSize = (s: UserStore) => generalConfig(s).fontSize;

export const userGeneralSettingsSelectors = {
  config: generalConfig,
  currentThemeMode,
  fontSize,
  neutralColor,
  primaryColor,
};
