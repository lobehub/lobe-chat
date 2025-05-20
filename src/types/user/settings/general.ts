import type { HighlighterProps, MermaidProps, NeutralColors, PrimaryColors } from '@lobehub/ui';

export interface UserGeneralConfig {
  fontSize: number;
  highlighterDarkTheme?: HighlighterProps['theme'];
  highlighterLightTheme?: HighlighterProps['theme'];
  mermaidDarkTheme?: MermaidProps['theme'];
  mermaidLightTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
}
