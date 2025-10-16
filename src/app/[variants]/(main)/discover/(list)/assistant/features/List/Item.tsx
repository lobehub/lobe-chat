import { Github } from '@lobehub/icons';
import { ActionIcon, Avatar, Block, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ClockIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import PublishedTime from '@/components/PublishedTime';
import { AGENTS_INDEX_GITHUB, AGENTS_OFFICIAL_URL } from '@/const/url';
import { useQuery } from '@/hooks/useQuery';
import { AssistantMarketSource, DiscoverAssistantItem } from '@/types/discover';

import TokenTag from './TokenTag';

const isUrl = (value?: string | null) => (value ? /^https?:\/\//.test(value) : false);

const useStyles = createStyles(({ css, token }) => {
  return {
    author: css`
      color: ${token.colorTextDescription};
    `,
    code: css`
      font-family: ${token.fontFamilyCode};
    `,
    desc: css`
      flex: 1;
      margin: 0 !important;
      color: ${token.colorTextSecondary};
    `,
    footer: css`
      margin-block-start: 16px;
      border-block-start: 1px dashed ${token.colorBorder};
      background: ${token.colorBgContainerSecondary};
    `,
    secondaryDesc: css`
      font-size: 12px;
      color: ${token.colorTextDescription};
    `,
    title: css`
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 500 !important;

      &:hover {
        color: ${token.colorLink};
      }
    `,
  };
});

const AssistantItem = memo<DiscoverAssistantItem>(
  ({
    createdAt,
    author,
    avatar,
    title,
    description,
    category,
    identifier,
    tokenUsage,
    pluginCount,
    knowledgeCount,
    backgroundColor,
  }) => {
    const { styles, theme } = useStyles();
    const router = useRouter();
    const { source } = useQuery() as { source?: AssistantMarketSource };
    const isLegacy = source === 'legacy';
    const authorString = typeof author === 'string' ? author : undefined;
    const avatarString = typeof avatar === 'string' ? avatar : undefined;
    const avatarSrc = avatarString && avatarString !== authorString ? avatarString : undefined;
    const authorName = authorString && !isUrl(authorString) ? authorString : undefined;
    const authorAvatar = authorString && isUrl(authorString) ? authorString : undefined;
    const baseGithubLocaleUrl = urlJoin(AGENTS_INDEX_GITHUB, 'tree/main/locales');
    const marketplaceHref = isLegacy
      ? urlJoin(baseGithubLocaleUrl, identifier)
      : urlJoin(AGENTS_OFFICIAL_URL, identifier);
    const link = qs.stringifyUrl(
      {
        query: source ? { source } : {},
        url: urlJoin('/discover/assistant', identifier),
      },
      { skipNull: true },
    );
    const { t } = useTranslation('discover');

    return (
      <Block
        clickable
        height={'100%'}
        onClick={() => {
          router.push(link);
        }}
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
        variant={'outlined'}
        width={'100%'}
      >
        <Flexbox
          align={'flex-start'}
          gap={16}
          horizontal
          justify={'space-between'}
          padding={16}
          width={'100%'}
        >
          <Flexbox
            gap={12}
            horizontal
            style={{
              overflow: 'hidden',
            }}
            title={identifier}
          >
            <Avatar
              avatar={avatarSrc}
              background={backgroundColor || 'transparent'}
              size={40}
              style={{ flex: 'none' }}
            />
            <Flexbox
              flex={1}
              gap={2}
              style={{
                overflow: 'hidden',
              }}
            >
              <Flexbox
                align={'center'}
                flex={1}
                gap={8}
                horizontal
                style={{
                  overflow: 'hidden',
                }}
              >
                <Link href={link} style={{ color: 'inherit', overflow: 'hidden' }}>
                  <Text as={'h2'} className={styles.title} ellipsis>
                    {title}
                  </Text>
                </Link>
              </Flexbox>
              {authorName && <div className={styles.author}>{authorName}</div>}
            </Flexbox>
          </Flexbox>
          <Flexbox align={'center'} gap={4} horizontal>
            <Link href={marketplaceHref} onClick={(e) => e.stopPropagation()} target={'_blank'}>
              {authorAvatar && !isLegacy ? (
                <Avatar avatar={authorAvatar} size={24} />
              ) : (
                <ActionIcon fill={theme.colorTextDescription} icon={Github} />
              )}
            </Link>
          </Flexbox>
        </Flexbox>
        <Flexbox flex={1} gap={12} paddingInline={16}>
          <Text
            as={'p'}
            className={styles.desc}
            ellipsis={{
              rows: 3,
            }}
          >
            {description}
          </Text>
          <TokenTag
            knowledgeCount={knowledgeCount}
            pluginCount={pluginCount}
            tokenUsage={tokenUsage}
          />
        </Flexbox>
        <Flexbox
          align={'center'}
          className={styles.footer}
          horizontal
          justify={'space-between'}
          padding={16}
        >
          <Flexbox
            align={'center'}
            className={styles.secondaryDesc}
            horizontal
            justify={'space-between'}
          >
            <Flexbox align={'center'} gap={4} horizontal>
              <Icon icon={ClockIcon} size={14} />
              <PublishedTime
                className={styles.secondaryDesc}
                date={createdAt}
                template={'MMM DD, YYYY'}
              />
            </Flexbox>
            {t(`category.assistant.${category}` as any)}
          </Flexbox>
        </Flexbox>
      </Block>
    );
  },
);

export default AssistantItem;
