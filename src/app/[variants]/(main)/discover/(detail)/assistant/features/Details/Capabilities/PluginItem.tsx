import { PluginSource } from '@lobechat/types';
import { Avatar, Block, Tag, Text } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';
import urlJoin from 'url-join';

import { useDiscoverStore } from '@/store/discover';

const useStyles = createStyles(({ css, token }) => {
  return {
    clickable: css`
      cursor: pointer;

      &:hover {
        .plugin-title {
          color: ${token.colorLink};
        }
      }
    `,
    desc: css`
      flex: 1;
      margin: 0 !important;
      font-size: 14px !important;
      color: ${token.colorTextSecondary};
    `,
    noLink: css`
      cursor: default;
    `,
    tag: css`
      flex-shrink: 0;
    `,
    title: css`
      margin: 0 !important;
      font-size: 14px !important;
      font-weight: 500 !important;
    `,
    titleRow: css`
      display: flex;
      gap: 8px;
      align-items: center;
    `,
  };
});

interface PluginItemProps {
  identifier: string;
}

const PluginItem = memo<PluginItemProps>(({ identifier }) => {
  const { t } = useTranslation('discover');
  const usePluginDetail = useDiscoverStore((s) => s.usePluginDetail);
  const { data, isLoading } = usePluginDetail({ identifier, withManifest: false });
  const { styles, cx } = useStyles();

  const sourceConfig = useMemo(() => {
    const source: PluginSource = data?.source || 'market';

    switch (source) {
      case 'builtin': {
        return {
          clickable: false,
          href: undefined,
          isExternal: false,
          tagColor: 'geekblue' as const,
          tagText: t('plugins.builtinTag'),
        };
      }
      case 'legacy': {
        return {
          clickable: true,
          href: data?.homepage,
          isExternal: true,
          tagColor: 'orange' as const,
          tagText: t('plugins.legacyTag'),
        };
      }
      // eslint-disable-next-line unicorn/no-useless-switch-case
      case 'market':
      default: {
        return {
          clickable: true,
          href: urlJoin('/discover/plugin', identifier),
          isExternal: false,
          tagColor: undefined,
          tagText: undefined,
        };
      }
    }
  }, [data?.source, data?.homepage, identifier, t]);

  if (isLoading || !data)
    return (
      <Block gap={12} horizontal key={identifier} padding={12} variant={'outlined'}>
        <Skeleton paragraph={{ rows: 1 }} title={false} />
      </Block>
    );

  const content = (
    <Block
      className={cx(sourceConfig.clickable ? styles.clickable : styles.noLink)}
      gap={12}
      horizontal
      key={identifier}
      padding={12}
      variant={'outlined'}
    >
      <Avatar avatar={data.avatar} size={40} style={{ flex: 'none' }} />
      <Flexbox
        flex={1}
        gap={6}
        style={{
          overflow: 'hidden',
        }}
      >
        <div className={styles.titleRow}>
          <Text as={'h2'} className={cx(styles.title, 'plugin-title')} ellipsis>
            {data.title}
          </Text>
          {sourceConfig.tagText && (
            <Tag className={styles.tag} color={sourceConfig.tagColor} size={'small'}>
              {sourceConfig.tagText}
            </Tag>
          )}
        </div>
        <Text
          as={'p'}
          className={styles.desc}
          ellipsis={{
            rows: 2,
          }}
        >
          {data.description}
        </Text>
      </Flexbox>
    </Block>
  );

  // For builtin plugins, no link wrapper
  if (!sourceConfig.clickable) {
    return content;
  }

  // For external links (legacy plugins), use <a> tag
  if (sourceConfig.isExternal && sourceConfig.href) {
    return (
      <a href={sourceConfig.href} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  // For internal links (market plugins), use Link component
  if (sourceConfig.href) {
    return <Link to={sourceConfig.href}>{content}</Link>;
  }

  return content;
});

export default PluginItem;
