import type { HighlighterProps, MermaidProps, NeutralColors, PrimaryColors } from '@lobehub/ui';

export interface UserGeneralConfig {
  fontSize: number;
  highlighterTheme?: HighlighterProps['theme'];
  mermaidTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
}
