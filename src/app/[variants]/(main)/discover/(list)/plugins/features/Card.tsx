import { Avatar, Tag } from '@lobehub/ui';
import { Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import dynamic from 'next/dynamic';
import qs from 'query-string';
import { CSSProperties, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverPlugintem } from '@/types/discover';

import CardBanner from '../../../components/CardBanner';
import { useCategoryItem } from './useCategory';

const Link = dynamic(() => import('next/link'), {
  loading: () => <Skeleton.Button size={'small'} style={{ height: 22 }} />,
  ssr: false,
});

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    position: relative;

    overflow: hidden;

    height: 100%;
    min-height: 162px;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
    box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary}
      inset;

    transition: box-shadow 0.2s ${token.motionEaseInOut};

    &:hover {
      box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillSecondary : token.colorFill} inset;
    }
  `,
  desc: css`
    min-height: 44px;
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,
  inner: css`
    padding: 16px;
  `,
  time: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-block-end: 0 !important;
    font-size: 18px !important;
    font-weight: bold;
  `,
}));

interface PluginCardProps
  extends Omit<DiscoverPlugintem, 'manifest' | 'suggestions' | 'socialData'> {
  className?: string;
  compact?: boolean;
  href: string;
  showCategory?: boolean;
  style?: CSSProperties;
}

const PluginCard = memo<PluginCardProps>(
  ({ className, showCategory, meta, createdAt, author, compact, style, href }) => {
    const { avatar, title, description, tags = [], category } = meta;
    const categoryItem = useCategoryItem(category, 12);
    const { cx, styles, theme } = useStyles();

    return (
      <Flexbox className={cx(styles.container, className)} gap={24} style={style}>
        {!compact && <CardBanner avatar={avatar} />}
        <Flexbox gap={12} padding={16}>
          <Link href={href}>
            <Flexbox gap={12}>
              <Flexbox
                align={'flex-end'}
                gap={16}
                horizontal
                justify={'space-between'}
                width={'100%'}
              >
                <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
                  {title}
                </Title>
                {compact ? (
                  <Avatar avatar={avatar} size={40} style={{ display: 'block' }} title={title} />
                ) : (
                  <Center
                    flex={'none'}
                    height={64}
                    style={{
                      background: theme.colorBgContainer,
                      borderRadius: '50%',
                      marginTop: -6,
                      overflow: 'hidden',
                      zIndex: 2,
                    }}
                    width={64}
                  >
                    <Avatar
                      alt={title}
                      avatar={avatar}
                      size={56}
                      style={{ display: 'block' }}
                      title={title}
                    />
                  </Center>
                )}
              </Flexbox>
              <Flexbox gap={8} horizontal style={{ fontSize: 12 }}>
                <div style={{ color: theme.colorTextSecondary }}>@{author}</div>
                {!compact && (
                  <time className={styles.time} dateTime={new Date(createdAt).toISOString()}>
                    {createdAt}
                  </time>
                )}
              </Flexbox>
              <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
                {description}
              </Paragraph>
            </Flexbox>
          </Link>
          <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
            {showCategory && categoryItem ? (
              <Link href={urlJoin('/discover/plugins', categoryItem.key)}>
                <Tag icon={categoryItem.icon}>{categoryItem.label}</Tag>
              </Link>
            ) : (
              tags
                .slice(0, 4)
                .filter(Boolean)
                .map((tag: string, index) => {
                  const url = qs.stringifyUrl({
                    query: { q: tag, type: 'plugins' },
                    url: '/discover/search',
                  });
                  return (
                    <Link href={url} key={index}>
                      <Tag>{startCase(tag).trim()}</Tag>
                    </Link>
                  );
                })
            )}
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default PluginCard;
