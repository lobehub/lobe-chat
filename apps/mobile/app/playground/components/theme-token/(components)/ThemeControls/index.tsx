import React from 'react';
import { Text, View } from 'react-native';

import ColorSwatches from '@/components/ColorSwatches';
import Slider from '@/components/Slider';
import { FONT_SIZE_LARGE, FONT_SIZE_SMALL, FONT_SIZE_STANDARD } from '@/const/common';
import {
  findCustomThemeName,
  PrimaryColors,
  NeutralColors,
  neutralColors,
  primaryColors,
  useThemeToken,
} from '@/theme';

import { useStyles } from './style';

// 主题控制器组件接口
interface ThemeControlsProps {
  fontSize?: number;
  neutralColor?: NeutralColors;
  onFontSizeChange: (size: number) => void;
  onNeutralColorChange: (color: NeutralColors) => void;
  onPrimaryColorChange: (color: PrimaryColors) => void;
  primaryColor?: PrimaryColors;
}

const ThemeControls: React.FC<ThemeControlsProps> = ({
  fontSize,
  neutralColor,
  onFontSizeChange,
  onNeutralColorChange,
  onPrimaryColorChange,
  primaryColor,
}) => {
  const token = useThemeToken();
  const { styles } = useStyles();

  // 预设主色
  const colorSwatchesData = [
    {
      color: 'rgba(0, 0, 0, 0)',
      title: 'Default',
    },
    {
      color: primaryColors.red,
      title: 'Red',
    },
    {
      color: primaryColors.orange,
      title: 'Orange',
    },
    {
      color: primaryColors.gold,
      title: 'Gold',
    },
    {
      color: primaryColors.yellow,
      title: 'Yellow',
    },
    {
      color: primaryColors.lime,
      title: 'Lime',
    },
    {
      color: primaryColors.green,
      title: 'Green',
    },
    {
      color: primaryColors.cyan,
      title: 'Cyan',
    },
    {
      color: primaryColors.blue,
      title: 'Blue',
    },
    {
      color: primaryColors.geekblue,
      title: 'Geekblue',
    },
    {
      color: primaryColors.purple,
      title: 'Purple',
    },
    {
      color: primaryColors.magenta,
      title: 'Magenta',
    },
    {
      color: primaryColors.volcano,
      title: 'Volcano',
    },
  ];

  // 预设中性色
  const neutralColorSwatchesData = [
    {
      color: 'rgba(0, 0, 0, 0)',
      title: 'Default',
    },
    {
      color: neutralColors.mauve,
      title: 'Mauve',
    },
    {
      color: neutralColors.slate,
      title: 'Slate',
    },
    {
      color: neutralColors.sage,
      title: 'Sage',
    },
    {
      color: neutralColors.olive,
      title: 'Olive',
    },
    {
      color: neutralColors.sand,
      title: 'Sand',
    },
  ];

  return (
    <View style={[styles.controlsContainer, { backgroundColor: token.colorBgElevated }]}>
      {/* 主色控制 */}
      <View style={styles.controlItem}>
        <Text style={[styles.controlLabel, { color: token.colorText }]}>主色 (primaryColor)</Text>
        <ColorSwatches
          colors={colorSwatchesData}
          gap={8}
          onChange={(color: any) => {
            const name = findCustomThemeName('primary', color) as PrimaryColors;
            onPrimaryColorChange(name);
          }}
          size={32}
          value={primaryColor ? primaryColors[primaryColor] : undefined}
        />
      </View>

      {/* 中性色控制 */}
      <View style={styles.controlItem}>
        <Text style={[styles.controlLabel, { color: token.colorText }]}>中性色 (neutralColor)</Text>
        <ColorSwatches
          colors={neutralColorSwatchesData}
          gap={8}
          onChange={(color: any) => {
            const name = findCustomThemeName('neutral', color) as NeutralColors;
            onNeutralColorChange(name);
          }}
          size={32}
          value={neutralColor ? neutralColors[neutralColor] : undefined}
        />
      </View>

      {/* 字体大小控制 */}
      <View style={styles.controlItem}>
        <Text style={[styles.controlLabel, { color: token.colorText }]}>字体大小 (fontSize)</Text>
        <Slider
          marks={{
            [FONT_SIZE_SMALL]: { label: <Text style={styles.fontSizeSmall}>A</Text> },
            [FONT_SIZE_STANDARD]: { label: <Text style={styles.fontSizeStandard}>标准</Text> },
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            [FONT_SIZE_LARGE]: { label: <Text style={styles.fontSizeLarge}>A</Text> },
          }}
          max={FONT_SIZE_LARGE}
          min={FONT_SIZE_SMALL}
          onChangeComplete={onFontSizeChange}
          step={1}
          value={fontSize}
        />
      </View>
    </View>
  );
};

export default ThemeControls;
export type { ThemeControlsProps };
