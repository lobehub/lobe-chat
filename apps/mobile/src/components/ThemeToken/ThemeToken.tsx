import { memo, useCallback, useState } from 'react';

import Center from '@/components/Center';
import Flexbox from '@/components/Flexbox';
import { ThemeProvider } from '@/components/ThemeProvider';
import {
  NeutralColors,
  PrimaryColors,
  darkAlgorithm,
  lightAlgorithm,
  useTheme,
} from '@/components/styles';

import CapsuleTabs, { type CapsuleTabItem } from '../CapsuleTabs';
import ThemeControls from './(components)/ThemeControls';
import TokenHighlight from './(components)/TokenJson';
import TokenTable from './(components)/TokenTable';
import type { ThemeTokensContentProps } from './type';

const ThemeTokensContent = memo<ThemeTokensContentProps>(
  ({
    localPrimaryColor,
    localNeutralColor,
    localFontSize,
    onFontSizeChange,
    onNeutralColorChange,
    onPrimaryColorChange,
  }) => {
    const token = useTheme();
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
      <Flexbox flex={1} gap={16} width={'100%'}>
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
        <Center>
          <CapsuleTabs items={tabItems} onSelect={handleTabSelect} selectedKey={viewMode} />
        </Center>

        {/* 根据视图模式显示不同的组件 */}
        {viewMode === 'table' ? (
          <TokenTable title="Design Tokens" token={token} />
        ) : (
          <TokenHighlight title="Design Tokens JSON" token={token} />
        )}
      </Flexbox>
    );
  },
);

ThemeTokensContent.displayName = 'ThemeTokensContent';

// 主组件，包装 ThemeProvider
const ThemeTokensPlayground = memo(() => {
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
});

ThemeTokensPlayground.displayName = 'ThemeTokensPlayground';

export default ThemeTokensPlayground;
