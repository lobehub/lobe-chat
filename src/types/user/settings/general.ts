import type { NeutralColors, PrimaryColors } from '@lobehub/ui';
import type { ThemeMode } from 'antd-style';

import { LocaleMode } from '@/types/locale';

export interface UserGeneralSettings {
  fontSize: number;
  language: LocaleMode;
  neutralColor?: NeutralColors;
  /**
   * @deprecated
   */
  password: string;
  primaryColor?: PrimaryColors;
  themeMode: ThemeMode;
}
