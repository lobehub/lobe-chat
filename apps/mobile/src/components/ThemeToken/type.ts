import type { NeutralColors, PrimaryColors } from '@/components/styles';

export interface ThemeTokensContentProps {
  localFontSize?: number;
  localNeutralColor?: NeutralColors | undefined;
  localPrimaryColor?: PrimaryColors | undefined;
  localThemeMode: 'light' | 'dark';
  onFontSizeChange: (size: number) => void;
  onNeutralColorChange: (color?: NeutralColors | undefined) => void;
  onPrimaryColorChange: (color?: PrimaryColors | undefined) => void;
  onToggleTheme: () => void;
}
