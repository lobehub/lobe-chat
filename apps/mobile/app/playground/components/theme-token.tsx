import { ChevronDown, Palette, Sun, Moon } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, TextInput } from 'react-native';

import { CapsuleTabs } from '@/components/CapsuleTabs';
import {
  useTheme,
  createStyles,
  seedToken,
  darkAlgorithm,
  defaultAlgorithm,
  ThemeProvider,
} from '@/theme';

interface TokenInfo {
  category: 'seed' | 'map' | 'alias';
  description: string;
  name: string;
  type: 'color' | 'size' | 'font' | 'spacing' | 'border' | 'shadow' | 'animation' | 'other';
  value: any;
}

interface TokenTableProps {
  searchText: string;
  title: string;
  tokens: TokenInfo[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'color': {
      return '🎨';
    }
    case 'size': {
      return '📏';
    }
    case 'font': {
      return '🔤';
    }
    case 'spacing': {
      return '📐';
    }
    case 'border': {
      return '⬜';
    }
    case 'shadow': {
      return '🌑';
    }
    case 'animation': {
      return '⚡';
    }
    default: {
      return '⚙️';
    }
  }
};

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
    chevron: {
      transform: [{ rotate: '0deg' }],
    },
    chevronExpanded: {
      transform: [{ rotate: '180deg' }],
    },
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
    presetButton: {
      alignItems: 'center',
      borderRadius: t.borderRadius,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      paddingHorizontal: t.paddingMD,
    },
    presetColorPreview: {
      borderRadius: 4,
      height: 16,
      marginRight: t.marginXS,
      width: 16,
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
    tabsContainer: {
      paddingHorizontal: t.paddingLG,
      paddingTop: t.paddingMD,
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
    typeCount: {
      borderRadius: t.borderRadius,
      paddingHorizontal: t.paddingSM,
      paddingVertical: 2,
    },
    typeCountText: {
      fontSize: t.fontSizeSM,
      fontWeight: '500',
    },
    typeHeader: {
      alignItems: 'center',
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: t.paddingMD,
    },
    typeHeaderLeft: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: t.marginSM,
    },
    typeIcon: {
      fontSize: 16,
    },
    typeName: {
      fontSize: t.fontSizeLG,
      fontWeight: '600',
    },

    typeSection: {
      marginBottom: t.marginLG,
    },
  };
});

const TokenTable: React.FC<TokenTableProps> = ({ tokens, title, searchText }) => {
  const { theme } = useTheme();
  const { styles } = useStyles();
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set(['color']));

  const filteredTokens = useMemo(() => {
    return tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(searchText.toLowerCase()) ||
        token.description.toLowerCase().includes(searchText.toLowerCase()) ||
        token.type.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [tokens, searchText]);

  const tokensByType = useMemo(() => {
    const grouped = filteredTokens.reduce(
      (acc, token) => {
        if (!acc[token.type]) {
          acc[token.type] = [];
        }
        acc[token.type].push(token);
        return acc;
      },
      {} as Record<string, TokenInfo[]>,
    );

    // Sort types by priority
    const typeOrder = [
      'color',
      'size',
      'font',
      'spacing',
      'border',
      'shadow',
      'animation',
      'other',
    ];
    const sortedTypes = Object.keys(grouped).sort((a, b) => {
      const aIndex = typeOrder.indexOf(a);
      const bIndex = typeOrder.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    return sortedTypes.map((type) => ({
      tokens: grouped[type].sort((a, b) => a.name.localeCompare(b.name)),
      type,
    }));
  }, [filteredTokens]);

  const toggleTypeExpansion = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const renderValue = (token: TokenInfo) => {
    const { value, type } = token;

    if (type === 'color' && typeof value === 'string') {
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

    if (type === 'shadow' && typeof value === 'object') {
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

      {tokensByType.map(({ type, tokens: typeTokens }) => (
        <View key={type} style={styles.typeSection}>
          <TouchableOpacity
            onPress={() => toggleTypeExpansion(type)}
            style={[styles.typeHeader, { borderBottomColor: theme.token.colorBorderSecondary }]}
          >
            <View style={styles.typeHeaderLeft}>
              <Text style={styles.typeIcon}>{getTypeIcon(type)}</Text>
              <Text style={[styles.typeName, { color: theme.token.colorText }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <View style={[styles.typeCount, { backgroundColor: theme.token.colorFillSecondary }]}>
                <Text style={[styles.typeCountText, { color: theme.token.colorTextSecondary }]}>
                  {typeTokens.length}
                </Text>
              </View>
            </View>
            <ChevronDown
              color={theme.token.colorTextTertiary}
              size={16}
              style={[styles.chevron, expandedTypes.has(type) && styles.chevronExpanded]}
            />
          </TouchableOpacity>

          {expandedTypes.has(type) && (
            <View style={styles.tokensContainer}>
              {typeTokens.map((token) => (
                <View
                  key={token.name}
                  style={[styles.tokenRow, { borderBottomColor: theme.token.colorBorderSecondary }]}
                >
                  <View style={styles.tokenInfo}>
                    <Text style={[styles.tokenName, { color: theme.token.colorText }]}>
                      {token.name}
                    </Text>
                    <Text
                      style={[styles.tokenDescription, { color: theme.token.colorTextSecondary }]}
                    >
                      {token.description}
                    </Text>
                  </View>
                  <View style={styles.tokenValueContainer}>{renderValue(token)}</View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

// 新增主题控制器组件
interface ThemeControlsProps {
  colorPrimary: string;
  fontSize: number;
  onColorPrimaryChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
}

const ThemeControls: React.FC<ThemeControlsProps> = ({
  colorPrimary,
  fontSize,
  onColorPrimaryChange,
  onFontSizeChange,
}) => {
  const { theme } = useTheme();
  const { styles } = useStyles();

  // 预设主色
  const colorPresets = [
    '#000000', // 黑色
    '#1677ff', // 蓝色
    '#52c41a', // 绿色
    '#faad14', // 橙色
    '#ff4d4f', // 红色
    '#722ed1', // 紫色
    '#13c2c2', // 青色
    '#eb2f96', // 粉色
  ];

  // 预设字体大小
  const fontSizePresets = [12, 14, 16, 18, 20];

  return (
    <View style={[styles.controlsContainer, { backgroundColor: theme.token.colorBgElevated }]}>
      {/* 主色控制 */}
      <View style={styles.controlItem}>
        <Text style={[styles.controlLabel, { color: theme.token.colorText }]}>
          主色 (colorPrimary)
        </Text>
        <View style={styles.controlRow}>
          <View style={[styles.presetColorPreview, { backgroundColor: colorPrimary }]} />
          <TextInput
            onChangeText={onColorPrimaryChange}
            placeholder="#000000"
            placeholderTextColor={theme.token.colorTextPlaceholder}
            style={[
              styles.controlInput,
              {
                backgroundColor: theme.token.colorBgContainer,
                borderColor: theme.token.colorBorder,
                color: theme.token.colorText,
              },
            ]}
            value={colorPrimary}
          />
        </View>
        <View style={styles.presetRow}>
          {colorPresets.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => onColorPrimaryChange(color)}
              style={[
                styles.presetButton,
                {
                  backgroundColor:
                    colorPrimary === color
                      ? theme.token.colorPrimaryBg
                      : theme.token.colorBgContainer,
                  borderColor:
                    colorPrimary === color ? theme.token.colorPrimary : theme.token.colorBorder,
                },
              ]}
            >
              <View style={[styles.presetColorPreview, { backgroundColor: color }]} />
              <Text
                style={[
                  styles.controlLabel,
                  {
                    color:
                      colorPrimary === color ? theme.token.colorPrimary : theme.token.colorText,
                    fontSize: 12,
                    fontWeight: '400',
                    marginBottom: 0,
                  },
                ]}
              >
                {color}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 字体大小控制 */}
      <View style={styles.controlItem}>
        <Text style={[styles.controlLabel, { color: theme.token.colorText }]}>
          字体大小 (fontSize)
        </Text>
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
            placeholderTextColor={theme.token.colorTextPlaceholder}
            style={[
              styles.controlInput,
              {
                backgroundColor: theme.token.colorBgContainer,
                borderColor: theme.token.colorBorder,
                color: theme.token.colorText,
              },
            ]}
            value={String(fontSize)}
          />
          <Text style={[styles.tokenValue, { color: theme.token.colorTextSecondary }]}>px</Text>
        </View>
        <View style={styles.presetRow}>
          {fontSizePresets.map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => onFontSizeChange(size)}
              style={[
                styles.presetButton,
                {
                  backgroundColor:
                    fontSize === size ? theme.token.colorPrimaryBg : theme.token.colorBgContainer,
                  borderColor:
                    fontSize === size ? theme.token.colorPrimary : theme.token.colorBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.controlLabel,
                  {
                    color: fontSize === size ? theme.token.colorPrimary : theme.token.colorText,
                    fontSize: 12,
                    fontWeight: '400',
                    marginBottom: 0,
                  },
                ]}
              >
                {size}px
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// 内部组件，使用 ThemeProvider 包装
interface ThemeTokensContentProps {
  localColorPrimary: string;
  localFontSize: number;
  onColorPrimaryChange: (color: string) => void;
  onFontSizeChange: (size: number) => void;
  onToggleTheme: () => void;
}

const ThemeTokensContent: React.FC<ThemeTokensContentProps> = ({
  localColorPrimary,
  localFontSize,
  onColorPrimaryChange,
  onFontSizeChange,
  onToggleTheme,
}) => {
  const { theme } = useTheme();
  const { styles } = useStyles();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'seed' | 'map' | 'alias'>('seed');

  // Generate all token types
  const seedTokens: TokenInfo[] = useMemo(() => {
    return Object.entries(seedToken).map(([name, value]) => {
      let type: TokenInfo['type'] = 'other';
      let description = 'Seed token';

      if (name.includes('color') || name.includes('Color')) {
        type = 'color';
        description = 'Base color value';
      } else if (
        name.includes('size') ||
        name.includes('Size') ||
        name.includes('Height') ||
        name.includes('Width')
      ) {
        type = 'size';
        description = 'Size value';
      } else if (name.includes('font') || name.includes('Font')) {
        type = 'font';
        description = 'Font-related value';
      } else if (
        name.includes('margin') ||
        name.includes('padding') ||
        name.includes('Margin') ||
        name.includes('Padding')
      ) {
        type = 'spacing';
        description = 'Spacing value';
      } else if (
        name.includes('border') ||
        name.includes('Border') ||
        name.includes('radius') ||
        name.includes('Radius')
      ) {
        type = 'border';
        description = 'Border-related value';
      } else if (name.includes('motion') || name.includes('Motion')) {
        type = 'animation';
        description = 'Animation-related value';
      }

      return {
        category: 'seed' as const,
        description,
        name,
        type,
        value,
      };
    });
  }, []);

  const mapTokens: TokenInfo[] = useMemo(() => {
    const mapToken = theme.isDark ? darkAlgorithm(seedToken) : defaultAlgorithm(seedToken);

    return Object.entries(mapToken).map(([name, value]) => {
      let type: TokenInfo['type'] = 'other';
      let description = 'Map token derived from seed';

      if (name.includes('color') || name.includes('Color')) {
        type = 'color';
        description = 'Color derived from seed token';
      } else if (
        name.includes('size') ||
        name.includes('Size') ||
        name.includes('Height') ||
        name.includes('Width')
      ) {
        type = 'size';
        description = 'Size derived from seed token';
      } else if (name.includes('font') || name.includes('Font')) {
        type = 'font';
        description = 'Font value derived from seed token';
      } else if (
        name.includes('margin') ||
        name.includes('padding') ||
        name.includes('Margin') ||
        name.includes('Padding')
      ) {
        type = 'spacing';
        description = 'Spacing derived from seed token';
      } else if (
        name.includes('border') ||
        name.includes('Border') ||
        name.includes('radius') ||
        name.includes('Radius')
      ) {
        type = 'border';
        description = 'Border value derived from seed token';
      } else if (name.includes('motion') || name.includes('Motion')) {
        type = 'animation';
        description = 'Animation value derived from seed token';
      }

      return {
        category: 'map' as const,
        description,
        name,
        type,
        value,
      };
    });
  }, [theme.isDark]);

  const aliasTokens: TokenInfo[] = useMemo(() => {
    return Object.entries(theme.token).map(([name, value]) => {
      let type: TokenInfo['type'] = 'other';
      let description = 'Alias token for component usage';

      if (name.includes('color') || name.includes('Color')) {
        type = 'color';
        description = 'Final color token for component usage';
      } else if (
        name.includes('size') ||
        name.includes('Size') ||
        name.includes('Height') ||
        name.includes('Width')
      ) {
        type = 'size';
        description = 'Final size token for component usage';
      } else if (name.includes('font') || name.includes('Font')) {
        type = 'font';
        description = 'Final font token for component usage';
      } else if (
        name.includes('margin') ||
        name.includes('padding') ||
        name.includes('Margin') ||
        name.includes('Padding')
      ) {
        type = 'spacing';
        description = 'Final spacing token for component usage';
      } else if (
        name.includes('border') ||
        name.includes('Border') ||
        name.includes('radius') ||
        name.includes('Radius')
      ) {
        type = 'border';
        description = 'Final border token for component usage';
      } else if (name.includes('shadow') || name.includes('Shadow')) {
        type = 'shadow';
        description = 'Shadow token for elevation effects';
      } else if (name.includes('motion') || name.includes('Motion')) {
        type = 'animation';
        description = 'Final animation token for component usage';
      }

      return {
        category: 'alias' as const,
        description,
        name,
        type,
        value,
      };
    });
  }, [theme.token]);

  const getCurrentTokens = () => {
    switch (activeTab) {
      case 'seed': {
        return seedTokens;
      }
      case 'map': {
        return mapTokens;
      }
      case 'alias': {
        return aliasTokens;
      }
      default: {
        return seedTokens;
      }
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'seed': {
        return 'Seed Tokens';
      }
      case 'map': {
        return 'Map Tokens';
      }
      case 'alias': {
        return 'Alias Tokens';
      }
      default: {
        return 'Seed Tokens';
      }
    }
  };

  const tabItems = useMemo(
    () => [
      { key: 'seed', label: 'Seed' },
      { key: 'map', label: 'Map' },
      { key: 'alias', label: 'Alias' },
    ],
    [],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.token.colorBgLayout }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette color={theme.token.colorText} size={24} />
          <Text style={[styles.headerTitle, { color: theme.token.colorText }]}>主题令牌</Text>
        </View>
        <TouchableOpacity
          onPress={onToggleTheme}
          style={[styles.themeToggle, { backgroundColor: theme.token.colorFillSecondary }]}
        >
          {theme.isDark ? (
            <Sun color={theme.token.colorText} size={20} />
          ) : (
            <Moon color={theme.token.colorText} size={20} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* 主题控制器 */}
        <ThemeControls
          colorPrimary={localColorPrimary}
          fontSize={localFontSize}
          onColorPrimaryChange={onColorPrimaryChange}
          onFontSizeChange={onFontSizeChange}
        />

        <View style={styles.tabsContainer}>
          <CapsuleTabs
            items={tabItems}
            onSelect={(key) => setActiveTab(key as 'seed' | 'map' | 'alias')}
            selectedKey={activeTab}
          />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.token.colorFillTertiary }]}>
          <TextInput
            onChangeText={setSearchText}
            placeholder="搜索令牌..."
            placeholderTextColor={theme.token.colorTextPlaceholder}
            style={[styles.searchInput, { color: theme.token.colorText }]}
            value={searchText}
          />
        </View>

        <TokenTable searchText={searchText} title={getTabTitle()} tokens={getCurrentTokens()} />
      </ScrollView>
    </SafeAreaView>
  );
};

// 主组件，包装 ThemeProvider
const ThemeTokensPlayground: React.FC = () => {
  const [localColorPrimary, setLocalColorPrimary] = useState('#1677ff');
  const [localFontSize, setLocalFontSize] = useState(14);
  const [localThemeMode, setLocalThemeMode] = useState<'light' | 'dark'>('light');

  // 本地主题配置，只影响当前组件树
  const localThemeConfig = {
    algorithm: localThemeMode === 'dark' ? darkAlgorithm : defaultAlgorithm,
    token: {
      colorPrimary: localColorPrimary,
      fontSize: localFontSize,
    },
  };

  const toggleLocalTheme = () => {
    setLocalThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={localThemeConfig}>
      <ThemeTokensContent
        localColorPrimary={localColorPrimary}
        localFontSize={localFontSize}
        onColorPrimaryChange={setLocalColorPrimary}
        onFontSizeChange={setLocalFontSize}
        onToggleTheme={toggleLocalTheme}
      />
    </ThemeProvider>
  );
};

export default ThemeTokensPlayground;
