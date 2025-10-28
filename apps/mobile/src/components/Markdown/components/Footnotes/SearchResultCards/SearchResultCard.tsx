import { Image } from 'expo-image';
import { memo, useMemo } from 'react';

import Block from '@/components/Block';
import Flexbox from '@/components/Flexbox';
import openUrl from '@/components/Markdown/utils/openUrl';
import Text from '@/components/Text';

export interface SearchResultCardProps {
  alt?: string;
  href?: string;
  title?: string;
  url: string;
}

const SearchResultCard = memo<SearchResultCardProps>(({ url, title, alt }) => {
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

  return (
    <Block
      gap={2}
      height={72}
      justify={'space-between'}
      key={url}
      onPress={() => openUrl(url)}
      padding={10}
      pressEffect
      variant={'outlined'}
      width={160}
    >
      <Text ellipsis={{ rows: 2 }} fontSize={12}>
        {displayTitle}
      </Text>
      <Flexbox align={'center'} gap={4} horizontal>
        <Image
          alt={alt || title || url}
          source={{
            uri: `https://icons.duckduckgo.com/ip3/${host}.ico`,
          }}
          style={{
            height: 14,
            width: 14,
          }}
        />
        <Text ellipsis fontSize={12} type={'secondary'}>
          {domain}
        </Text>
      </Flexbox>
    </Block>
  );
});

SearchResultCard.displayName = 'SearchResultCard';

export default SearchResultCard;
