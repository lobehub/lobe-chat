import type { HighlighterProps, MermaidProps, NeutralColors, PrimaryColors } from '@lobehub/ui';

import { ResponseAnimationStyle } from '@/types/llm';

export type AnimationMode = 'disabled' | 'agile' | 'elegant';

export interface UserGeneralConfig {
  animationMode?: AnimationMode;
  fontSize: number;
  highlighterTheme?: HighlighterProps['theme'];
  mermaidTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
  transitionMode?: ResponseAnimationStyle;
}
