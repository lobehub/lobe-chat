import { CrawlErrorResult, CrawlSuccessResult } from '@lobechat/web-crawler';
import { Alert, Block, Flexbox, Text, useTheme } from '@lobehub/ui-rn';
import { ExternalLinkIcon } from 'lucide-react-native';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

interface PageResultProps {
  crawler: string;
  originalUrl: string;
  result: CrawlSuccessResult | CrawlErrorResult;
}

/**
 * PageResult - 页面爬取结果卡片
 * 简化版，点击后在浏览器中打开页面
 */
const PageResult = memo<PageResultProps>(({ result, crawler, originalUrl }) => {
  const { t } = useTranslation('tool');
  const theme = useTheme();

  const isError = 'errorType' in result;

  const { url, title, description, contentLength } = useMemo(() => {
    if (isError) {
      return {
        contentLength: 0,
        description:
          (result as CrawlErrorResult).errorMessage || (result as CrawlErrorResult).content,
        title: originalUrl,
        url: originalUrl,
      };
    }
    const successResult = result as CrawlSuccessResult;
    return {
      contentLength: successResult.content?.length || 0,
      description: successResult.description || successResult.content?.slice(0, 100),
      title: successResult.title || originalUrl,
      url: successResult.url,
    };
  }, [result, originalUrl, isError]);

  const handlePress = () => {
    if (!isError) {
      Linking.openURL(url);
    }
  };

  // 错误状态
  if (isError) {
    return (
      <Block gap={8} padding={12} variant="borderless" width={280}>
        <Alert message={description} type="error" />
        <Flexbox gap={4}>
          <Text fontSize={11} type="secondary">
            {t('search.crawPages.meta.crawler')}: {crawler}
          </Text>
        </Flexbox>
      </Block>
    );
  }

  // 成功状态
  return (
    <Block
      gap={8}
      justify="space-between"
      onPress={handlePress}
      pressEffect
      variant="outlined"
      width={240}
    >
      {/* 头部 */}
      <Flexbox gap={8} padding={12}>
        <Flexbox align="center" gap={8} horizontal justify="space-between">
          <Text ellipsis fontSize={12} style={{ flex: 1 }} weight={500}>
            {title}
          </Text>
          <ExternalLinkIcon color={theme.colorTextQuaternary} size={14} />
        </Flexbox>
        <Text ellipsis={{ rows: 2 }} fontSize={11} type="secondary">
          {description}
        </Text>
      </Flexbox>

      {/* 底部信息 */}
      <Flexbox
        gap={8}
        horizontal
        padding={8}
        style={{ backgroundColor: theme.colorFillQuaternary, borderRadius: 8 }}
      >
        <Flexbox flex={1} gap={6} horizontal>
          <Text fontSize={11} type="secondary">
            {t('search.crawPages.meta.words')}:
          </Text>
          <Text fontSize={11} type="secondary">
            {contentLength}
          </Text>
        </Flexbox>
        <Flexbox flex={1} gap={6} horizontal>
          <Text fontSize={11} type="secondary">
            {t('search.crawPages.meta.crawler')}:
          </Text>
          <Text fontSize={11} type="secondary">
            {crawler}
          </Text>
        </Flexbox>
      </Flexbox>
    </Block>
  );
});

PageResult.displayName = 'PageResult';

export default PageResult;
