import { Block, Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

interface PageLoadingProps {
  url: string;
}

/**
 * PageLoading - 页面爬取加载中卡片
 */
const PageLoading = memo<PageLoadingProps>(({ url }) => {
  const { t } = useTranslation('tool');
  const theme = useTheme();

  return (
    <Block gap={8} height={136} justify="space-between" variant="outlined" width={280}>
      {/* URL */}
      <Flexbox gap={8} padding={12}>
        <Text ellipsis fontSize={12} type="secondary">
          {url}
        </Text>
        <Flexbox gap={4}>
          <ActivityIndicator color={theme.colorTextTertiary} size="small" />
        </Flexbox>
      </Flexbox>

      {/* 底部状态 */}
      <Flexbox padding={8} style={{ backgroundColor: theme.colorFillQuaternary, borderRadius: 8 }}>
        <Text fontSize={11} type="secondary">
          {t('search.crawPages.crawling')}
        </Text>
      </Flexbox>
    </Block>
  );
});

PageLoading.displayName = 'PageLoading';

export default PageLoading;
