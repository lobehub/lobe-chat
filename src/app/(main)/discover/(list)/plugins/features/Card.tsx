import { Avatar } from '@lobehub/ui';
import { Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Center, Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverPlugintem } from '@/types/discover';

import CardBanner from '../../features/CardBanner';

const TagList = dynamic(() => import('./TagList'), {
  loading: () => <Skeleton.Button size={'small'} style={{ height: 22 }} />,
  ssr: false,
});

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    height: 100%;
    min-height: 162px;

    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
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
  extends Omit<DiscoverPlugintem, 'manifest' | 'suggestions' | 'socialData'>,
    Omit<FlexboxProps, 'children'> {
  showCategory?: boolean;
  variant?: 'default' | 'compact';
}

const PluginCard = memo<PluginCardProps>(
  ({ className, showCategory, meta, createdAt, author, variant, ...rest }) => {
    const { avatar, title, description, tags, category } = meta;

    const { cx, styles, theme } = useStyles();
    const isCompact = variant === 'compact';

    return (
      <Flexbox className={cx(styles.container, className)} gap={24} {...rest}>
        {!isCompact && <CardBanner avatar={avatar} />}
        <Flexbox className={styles.inner} gap={12}>
          <Flexbox align={'flex-end'} gap={16} horizontal justify={'space-between'} width={'100%'}>
            <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
              {title}
            </Title>
            {isCompact ? (
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
          <Flexbox gap={12} horizontal style={{ fontSize: 12 }}>
            <span style={{ color: theme.colorTextSecondary, fontSize: 12 }}>@{author}</span>
            {!isCompact && (
              <time className={styles.time} dateTime={new Date(createdAt).toISOString()}>
                {createdAt}
              </time>
            )}
          </Flexbox>
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {description}
          </Paragraph>
          <TagList category={category} showCategory={showCategory} tags={tags || []} />
        </Flexbox>
      </Flexbox>
    );
  },
);

export default PluginCard;
