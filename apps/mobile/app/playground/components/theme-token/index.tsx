import { Palette, Sun, Moon } from 'lucide-react-native';
import React, { useState, useCallback, memo } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import CapsuleTabs, { CapsuleTabItem } from '@/components/CapsuleTabs';
import ThemeControls from 'app/playground/components/theme-token/(components)/ThemeControls';
import TokenHighlight from 'app/playground/components/theme-token/(components)/TokenHighlight';
import TokenTable from 'app/playground/components/theme-token/(components)/TokenTable';
import {
  useTheme,
  darkAlgorithm,
  lightAlgorithm,
  ThemeProvider,
  useThemeToken,
  PrimaryColors,
  NeutralColors,
} from '@/theme';

import { useStyles } from './style';

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

const ThemeTokensContent: React.FC<ThemeTokensContentProps> = memo(
  ({
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
    const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

    // CapsuleTabs 配置
    const tabItems: CapsuleTabItem[] = [
      { key: 'table', label: '表格视图' },
      { key: 'json', label: 'JSON 视图' },
    ];

    // 优化回调函数
    const handleTabSelect = useCallback((key: string) => {
      setViewMode(key as 'table' | 'json');
    }, []);

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

          {/* 视图模式切换 */}
          <View style={styles.viewModeContainer}>
            <CapsuleTabs items={tabItems} onSelect={handleTabSelect} selectedKey={viewMode} />
          </View>

          {/* 根据视图模式显示不同的组件 */}
          {viewMode === 'table' ? (
            <TokenTable title="Design Tokens" token={token} />
          ) : (
            <TokenHighlight title="Design Tokens JSON" token={token} />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  },
);

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

  const toggleLocalTheme = useCallback(() => {
    setLocalThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

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
