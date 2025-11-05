import { A as Link } from '@expo/html-elements';
import { ReactNode, memo } from 'react';
import { Components } from 'react-markdown';
import { Linking } from 'react-native';

import type { CitationItem } from '@/components/Markdown/type';
import Tag from '@/components/Tag';

import { useStyles } from '../style';

interface AProps {
  'aria-describedby'?: string;
  'children'?: ReactNode;
  'citations'?: CitationItem[];
  'className'?: string;
  'data-footnote-ref'?: boolean;
  'data-link'?: string;
  'href'?: string;
  'id'?: string;
}

const AComponent = memo<AProps>(({ children, href, citations, ...rest }) => {
  const { styles } = useStyles();

  // 处理 [^1] 格式的 citation
  if (rest['data-footnote-ref']) {
    const handlePress = () => {
      try {
        // 从 data-link 中解析 citation 信息
        const linkData = rest['data-link'] ? JSON.parse(rest['data-link']) : null;
        const url = linkData?.url;
        if (url) {
          Linking.openURL(url);
        }
      } catch (error) {
        console.error('Failed to parse citation link:', error);
      }
    };

    return (
      <Tag onPress={handlePress} size={'small'} style={{ transform: [{ scale: 0.8 }] }}>
        {children}
      </Tag>
    );
  }

  // 处理 [1] 格式的 citation，搭配 citations 注入
  const match = href?.match(/citation-(\d+)/);
  if (match && citations) {
    const index = Number.parseInt(match[1]) - 1;
    const citationDetail = citations[index];

    const handlePress = () => {
      if (citationDetail?.url) {
        Linking.openURL(citationDetail.url);
      }
    };

    return (
      <Tag onPress={handlePress} size={'small'} style={{ transform: [{ scale: 0.8 }] }}>
        {match[1]}
      </Tag>
    );
  }

  // 隐藏返回引用的链接
  if (rest.className === 'data-footnote-backref') {
    return null;
  }

  // 普通链接
  return (
    <Link href={href} style={[styles.text, styles.link]}>
      {children}
    </Link>
  );
});

AComponent.displayName = 'A';

const A: Components['a'] = AComponent as any;

export default A;
