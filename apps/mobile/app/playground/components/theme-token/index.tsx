import { Palette, Sun, Moon } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';

import Button from '@/components/Button';
import ColorSwatches from '@/components/ColorSwatches';
import TokenTable, {
  type TokenInfo,
} from 'app/playground/components/theme-token/(components)/TokenTable';
import { useTheme, darkAlgorithm, lightAlgorithm, ThemeProvider, useThemeToken } from '@/theme';
import {
  findCustomThemeName,
  PrimaryColors,
  NeutralColors,
  neutralColors,
  primaryColors,
} from '@/theme/color';

import { useStyles } from './style';

// 新增主题控制器组件
interface ThemeControlsProps {
  fontSize: number;
  neutralColor: NeutralColors;
  onFontSizeChange: (size: number) => void;
  onNeutralColorChange: (color: NeutralColors) => void;
  onPrimaryColorChange: (color: PrimaryColors) => void;
  primaryColor: PrimaryColors;
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

  // 预设字体大小
  const fontSizePresets = [12, 14, 16, 18, 20];

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
        <View style={styles.controlRow}>
          <TextInput
            keyboardType="numeric"
            onChangeText={(text) => {
              const size = parseInt(text, 10);
              if (!isNaN(size) && size > 0) {
                onFontSizeChange(size);
              }
            }}
            placeholder="14"
            placeholderTextColor={token.colorTextPlaceholder}
            style={[
              styles.controlInput,
              {
                backgroundColor: token.colorBgContainer,
                borderColor: token.colorBorder,
                color: token.colorText,
              },
            ]}
            value={String(fontSize)}
          />
          <Text style={[{ color: token.colorTextSecondary }]}>px</Text>
        </View>
        <View style={styles.presetRow}>
          {fontSizePresets.map((size) => (
            <Button
              key={size}
              onPress={() => onFontSizeChange(size)}
              size="small"
              type={fontSize === size ? 'primary' : 'default'}
            >
              {size}px
            </Button>
          ))}
        </View>
      </View>
    </View>
  );
};

// 内部组件，使用 ThemeProvider 包装
interface ThemeTokensContentProps {
  localFontSize: number;
  localNeutralColor: NeutralColors;
  localPrimaryColor: PrimaryColors;
  localThemeMode: 'light' | 'dark';
  onFontSizeChange: (size: number) => void;
  onNeutralColorChange: (color: NeutralColors) => void;
  onPrimaryColorChange: (color: PrimaryColors) => void;
  onToggleTheme: () => void;
}

const ThemeTokensContent: React.FC<ThemeTokensContentProps> = ({
  localPrimaryColor,
  localNeutralColor,
  localFontSize,
  localThemeMode,
  onFontSizeChange,
  onNeutralColorChange,
  onPrimaryColorChange,
  onToggleTheme,
}) => {
  const { theme } = useTheme();
  const token = useThemeToken();
  const { styles } = useStyles();
  const [searchText, setSearchText] = useState('');

  // 将 token 对象转换为 TokenInfo 数组
  const allTokens: TokenInfo[] = useMemo(() => {
    return Object.entries(token).map(([name, value]) => ({
      description: 'Design token for theme system',
      name,
      type: 'other' as const, // 简化类型，不再区分
      value,
    }));
  }, [localThemeMode, localPrimaryColor, localNeutralColor, localFontSize]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette color={token.colorText} size={24} />
          <Text style={[styles.headerTitle, { color: token.colorText }]}>主题令牌</Text>
        </View>
        <TouchableOpacity onPress={onToggleTheme} style={styles.themeToggle}>
          {theme.isDark ? (
            <Sun color={token.colorText} size={20} />
          ) : (
            <Moon color={token.colorText} size={20} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* 主题控制器 */}
        <ThemeControls
          fontSize={localFontSize}
          neutralColor={localNeutralColor}
          onFontSizeChange={onFontSizeChange}
          onNeutralColorChange={onNeutralColorChange}
          onPrimaryColorChange={onPrimaryColorChange}
          primaryColor={localPrimaryColor}
        />

        <View style={styles.searchContainer}>
          <TextInput
            onChangeText={setSearchText}
            placeholder="搜索令牌..."
            placeholderTextColor={token.colorTextPlaceholder}
            style={styles.searchInput}
            value={searchText}
          />
        </View>

        <TokenTable searchText={searchText} title="Design Tokens" tokens={allTokens} />
      </ScrollView>
    </SafeAreaView>
  );
};

// 主组件，包装 ThemeProvider
const ThemeTokensPlayground: React.FC = () => {
  const [localPrimaryColor, setLocalPrimaryColor] = useState('primary' as PrimaryColors);
  const [localNeutralColor, setLocalNeutralColor] = useState('mauve' as NeutralColors);
  const [localFontSize, setLocalFontSize] = useState(14);
  const [localThemeMode, setLocalThemeMode] = useState<'light' | 'dark'>('light');

  // 本地主题配置，只影响当前组件树
  const localThemeConfig = {
    algorithm: localThemeMode === 'dark' ? darkAlgorithm : lightAlgorithm,
    token: {
      fontSize: localFontSize,
      neutralColor: localNeutralColor,
      primaryColor: localPrimaryColor,
    },
  };

  const toggleLocalTheme = () => {
    setLocalThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={localThemeConfig}>
      <ThemeTokensContent
        localFontSize={localFontSize}
        localNeutralColor={localNeutralColor}
        localPrimaryColor={localPrimaryColor}
        localThemeMode={localThemeMode}
        onFontSizeChange={setLocalFontSize}
        onNeutralColorChange={setLocalNeutralColor}
        onPrimaryColorChange={setLocalPrimaryColor}
        onToggleTheme={toggleLocalTheme}
      />
    </ThemeProvider>
  );
};

export default ThemeTokensPlayground;
