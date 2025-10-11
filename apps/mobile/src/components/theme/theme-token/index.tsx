import { Moon, Sun } from 'lucide-react-native';
import React, { memo, useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import CapsuleTabs, { type CapsuleTabItem } from '@/components/CapsuleTabs';
import PageContainer from '@/components/PageContainer';
import {
  NeutralColors,
  PrimaryColors,
  ThemeProvider,
  darkAlgorithm,
  lightAlgorithm,
  useTheme,
  useThemeMode,
} from '@/theme';

import ThemeControls from './(components)/ThemeControls';
import TokenHighlight from './(components)/TokenJson';
import TokenTable from './(components)/TokenTable';
import { useStyles } from './style';

// 内部组件，使用 ThemeProvider 包装
interface ThemeTokensContentProps {
  localFontSize?: number;
  localNeutralColor?: NeutralColors | undefined;
  localPrimaryColor?: PrimaryColors | undefined;
  localThemeMode: 'light' | 'dark';
  onFontSizeChange: (size: number) => void;
  onNeutralColorChange: (color?: NeutralColors | undefined) => void;
  onPrimaryColorChange: (color?: PrimaryColors | undefined) => void;
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
    const { isDarkMode } = useThemeMode();
    const token = useTheme();
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
      <PageContainer
        extra={
          <TouchableOpacity onPress={onToggleTheme} style={styles.themeToggle}>
            {isDarkMode ? (
              <Sun color={token.colorText} size={20} />
            ) : (
              <Moon color={token.colorText} size={20} />
            )}
          </TouchableOpacity>
        }
        showBack
        title="主题令牌"
      >
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
      </PageContainer>
    );
  },
);

// 主组件，包装 ThemeProvider
const ThemeTokensPlayground: React.FC = () => {
  const [localPrimaryColor, setLocalPrimaryColor] = useState<PrimaryColors | undefined>();
  const [localNeutralColor, setLocalNeutralColor] = useState<NeutralColors | undefined>();
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
