import { UniformSearchResult } from '@lobechat/types';
import { Block, Flexbox, Text } from '@lobehub/ui-rn';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Linking } from 'react-native';

/**
 * SearchResultItem - 搜索结果项
 * 参考 Markdown Footnotes SearchResultCard 实现
 */
const SearchResultItem = memo<UniformSearchResult>(({ url, title }) => {
  const [displayTitle, domain, host] = useMemo(() => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const hostForUrl = urlObj.host;

      let displayTitle = title;
      if (title === url) {
        displayTitle = hostForUrl + urlObj.pathname;
      }

      return [displayTitle, domain, hostForUrl];
    } catch {
      return [title, url, url];
    }
  }, [url, title]);

  const handlePress = () => {
    Linking.openURL(url);
  };

  return (
    <Block
      gap={2}
      height={72}
      justify="space-between"
      onPress={handlePress}
      padding={10}
      pressEffect
      variant="outlined"
      width={160}
    >
      <Text ellipsis={{ rows: 2 }} fontSize={12}>
        {displayTitle}
      </Text>
      <Flexbox align="center" gap={4} horizontal>
        <Image
          alt={title || url}
          source={{
            uri: `https://icons.duckduckgo.com/ip3/${host}.ico`,
          }}
          style={{
            height: 14,
            width: 14,
          }}
        />
        <Text ellipsis fontSize={12} type="secondary">
          {domain}
        </Text>
      </Flexbox>
    </Block>
  );
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;
