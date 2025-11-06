import type { HighlighterProps, MermaidProps, NeutralColors, PrimaryColors } from '@lobehub/ui';

import type { ResponseAnimationStyle } from '../../aiProvider';

export type AnimationMode = 'disabled' | 'agile' | 'elegant';

export interface UserGeneralConfig {
  animationMode?: AnimationMode;
  /**
   * 删除话题时是否同时删除话题中的文件（不会删除被其他话题使用的文件）
   * @default false
   */
  deleteTopicFiles?: boolean;
  fontSize: number;
  highlighterTheme?: HighlighterProps['theme'];
  mermaidTheme?: MermaidProps['theme'];
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
  transitionMode?: ResponseAnimationStyle;
}
