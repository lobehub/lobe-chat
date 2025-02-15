import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

export interface UserGeneralConfig {
  fontSize: number;
  neutralColor?: NeutralColors;
  primaryColor?: PrimaryColors;
  themeMode: ThemeMode;
}
