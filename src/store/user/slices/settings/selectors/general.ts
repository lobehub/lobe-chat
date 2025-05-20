import { UserStore } from '../../../store';
import { currentSettings } from './settings';

const generalConfig = (s: UserStore) => currentSettings(s).general || {};

const neutralColor = (s: UserStore) => generalConfig(s).neutralColor;
const primaryColor = (s: UserStore) => generalConfig(s).primaryColor;
const fontSize = (s: UserStore) => generalConfig(s).fontSize;
const highlighterDarkTheme = (s: UserStore) => generalConfig(s).highlighterDarkTheme;
const highlighterLightTheme = (s: UserStore) => generalConfig(s).highlighterLightTheme;
const mermaidDarkTheme = (s: UserStore) => generalConfig(s).mermaidDarkTheme;
const mermaidLightTheme = (s: UserStore) => generalConfig(s).mermaidLightTheme;

export const userGeneralSettingsSelectors = {
  config: generalConfig,
  fontSize,
  highlighterDarkTheme,
  highlighterLightTheme,
  mermaidDarkTheme,
  mermaidLightTheme,
  neutralColor,
  primaryColor,
};
