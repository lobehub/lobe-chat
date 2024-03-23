import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import { LocaleMode } from '@/types/locale';

export interface GlobalBaseSettings {
  fontSize: number;
  language: LocaleMode;
  neutralColor?: NeutralColors;
  password: string;
  primaryColor?: PrimaryColors;
  themeMode: ThemeMode;
}
