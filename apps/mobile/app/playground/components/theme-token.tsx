import { Palette, Sun, Moon } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';

import Button from '@/components/Button';
import ColorSwatches from '@/components/ColorSwatches';
import {
  useTheme,
  createStyles,
  darkAlgorithm,
  lightAlgorithm,
  ThemeProvider,
  useThemeToken,
} from '@/theme';
import {
  findCustomThemeName,
  PrimaryColors,
  NeutralColors,
  neutralColors,
  primaryColors,
} from '@/theme/color';

interface TokenInfo {
  description: string;
  name: string;
  type: 'other';
  value: any;
}

interface TokenTableProps {
  searchText: string;
  title: string;
  tokens: TokenInfo[];
}

const useStyles = createStyles((token) => {
  const t = token || {
    borderRadius: 6,
    borderRadiusLG: 12,
    fontFamilyCode: 'monospace',
    fontSize: 14,
    fontSizeHeading3: 18,
    fontSizeLG: 16,
    fontSizeSM: 12,
    marginLG: 16,
    marginSM: 8,
    marginXS: 4,
    marginXXS: 2,
    paddingLG: 16,
    paddingMD: 12,
    paddingSM: 8,
  };

  return {
    colorPreview: {
      borderRadius: t.borderRadius,
      borderWidth: 1,
      height: 20,
      width: 20,
    },
    colorValueContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: t.marginSM,
    },
    // 新增控制器样式
    controlInput: {
      borderRadius: t.borderRadius,
      borderWidth: 1,
      flex: 1,
      fontSize: t.fontSize,
      height: 40,
      paddingHorizontal: t.paddingMD,
    },
    controlItem: {
      marginBottom: t.marginLG,
    },
    controlLabel: {
      fontSize: t.fontSizeLG,
      fontWeight: '600',
      marginBottom: t.marginSM,
    },
    controlRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: t.marginSM,
    },
    controlsContainer: {
      backgroundColor: t.colorBgElevated || '#fff',
      borderRadius: t.borderRadiusLG,
      margin: t.marginLG,
      padding: t.paddingLG,
    },
    header: {
      alignItems: 'center',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: t.paddingLG,
    },
    headerLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: t.marginSM,
    },
    headerTitle: {
      fontSize: t.fontSizeLG,
      fontWeight: '600',
    },
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.marginSM,
      marginTop: t.marginSM,
    },
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    searchContainer: {
      borderRadius: t.borderRadius,
      margin: t.marginLG,
      paddingHorizontal: t.paddingMD,
    },
    searchInput: {
      fontSize: t.fontSize,
      height: 40,
    },
    shadowValueContainer: {
      alignItems: 'flex-end',
    },
    tableSubtitle: {
      fontSize: t.fontSize,
      marginBottom: t.marginLG,
    },
    tableTitle: {
      fontSize: t.fontSizeHeading3,
      fontWeight: '600',
      marginBottom: t.marginXS,
    },

    themeToggle: {
      alignItems: 'center',
      borderRadius: 20,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    tokenDescription: {
      fontSize: t.fontSizeSM,
      marginTop: t.marginXXS,
    },
    tokenInfo: {
      flex: 1,
      paddingRight: t.paddingMD,
    },
    tokenName: {
      fontFamily: t.fontFamilyCode,
      fontSize: t.fontSize,
      fontWeight: '500',
    },
    tokenRow: {
      alignItems: 'flex-start',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: t.paddingMD,
    },
    tokenTable: {
      borderRadius: t.borderRadiusLG,
      margin: t.marginLG,
      marginTop: 0,
      padding: t.paddingLG,
    },
    tokenValue: {
      fontFamily: t.fontFamilyCode,
      fontSize: t.fontSizeSM,
    },
    tokenValueContainer: {
      flexShrink: 0,
      maxWidth: '50%',
    },
    tokensContainer: {
      paddingTop: t.paddingMD,
    },
  };
});

const TokenTable: React.FC<TokenTableProps> = ({ tokens, title, searchText }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchText.toLowerCase()) ||
        token.description.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [tokens, searchText]);

  // 直接按名称排序，不再分组
  const sortedTokens = useMemo(() => {
    return filteredTokens.sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredTokens]);

  const renderValue = (token: TokenInfo) => {
    const { value, name } = token;

    // 根据名称判断是否为颜色值
    if ((name.includes('color') || name.includes('Color')) && typeof value === 'string') {
      return (
        <View style={styles.colorValueContainer}>
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: value },
              { borderColor: theme.token.colorBorderSecondary },
            ]}
          />
          <Text style={[styles.tokenValue, { color: theme.token.colorText }]}>{value}</Text>
        </View>
      );
    }

    // 根据名称判断是否为阴影对象
    if ((name.includes('shadow') || name.includes('Shadow')) && typeof value === 'object') {
      return (
        <View style={styles.shadowValueContainer}>
          <Text style={[styles.tokenValue, { color: theme.token.colorText }]}>
            {JSON.stringify(value, null, 2)}
          </Text>
        </View>
      );
    }

    return (
      <Text style={[styles.tokenValue, { color: theme.token.colorText }]}>
        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
      </Text>
    );
  };

  return (
    <View style={[styles.tokenTable, { backgroundColor: theme.token.colorBgElevated }]}>
      <Text style={[styles.tableTitle, { color: theme.token.colorText }]}>{title}</Text>
      <Text style={[styles.tableSubtitle, { color: theme.token.colorTextSecondary }]}>
        {filteredTokens.length} tokens
      </Text>

      <View style={styles.tokensContainer}>
        {sortedTokens.map((token) => (
          <View
            key={token.name}
            style={[styles.tokenRow, { borderBottomColor: theme.token.colorBorderSecondary }]}
          >
            <View style={styles.tokenInfo}>
              <Text style={[styles.tokenName, { color: theme.token.colorText }]}>{token.name}</Text>
              <Text style={[styles.tokenDescription, { color: theme.token.colorTextSecondary }]}>
                {token.description}
              </Text>
            </View>
            <View style={styles.tokenValueContainer}>{renderValue(token)}</View>
          </View>
        ))}
      </View>
    </View>
  );
};

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
          <Text style={[styles.tokenValue, { color: token.colorTextSecondary }]}>px</Text>
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
  onFontSizeChange: (size: number) => void;
  onNeutralColorChange: (color: NeutralColors) => void;
  onPrimaryColorChange: (color: PrimaryColors) => void;
  onToggleTheme: () => void;
}

const ThemeTokensContent: React.FC<ThemeTokensContentProps> = ({
  localPrimaryColor,
  localNeutralColor,
  localFontSize,
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
  }, [theme.isDark, token.primaryColor, token.fontSize]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette color={token.colorText} size={24} />
          <Text style={[styles.headerTitle, { color: token.colorText }]}>主题令牌</Text>
        </View>
        <TouchableOpacity
          onPress={onToggleTheme}
          style={[styles.themeToggle, { backgroundColor: token.colorFillSecondary }]}
        >
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

        <View style={[styles.searchContainer, { backgroundColor: token.colorFillTertiary }]}>
          <TextInput
            onChangeText={setSearchText}
            placeholder="搜索令牌..."
            placeholderTextColor={token.colorTextPlaceholder}
            style={[styles.searchInput, { color: token.colorText }]}
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
        onFontSizeChange={setLocalFontSize}
        onNeutralColorChange={setLocalNeutralColor}
        onPrimaryColorChange={setLocalPrimaryColor}
        onToggleTheme={toggleLocalTheme}
      />
    </ThemeProvider>
  );
};

export default ThemeTokensPlayground;
