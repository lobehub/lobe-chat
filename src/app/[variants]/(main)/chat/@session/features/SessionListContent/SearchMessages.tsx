'use client';

import { Button, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useSWRInfinite from 'swr/infinite';

import { INBOX_SESSION_ID } from '@/const/session';
import { messageService } from '@/services/message';
import { useSessionStore } from '@/store/session';
import type { MessageKeywordSearchResult } from '@/types/message';

import SkeletonList from '../SkeletonList';
import useMessageNavigator from './useMessageNavigator';

const PAGE_SIZE = 20;
const SEARCH_MESSAGES_KEY = 'session.search.messages';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 12px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorFillTertiary};
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-block-end: 12px;
  `,
  highlight: css`
    padding-block: 0;
    padding-inline: 2px;
    border-radius: ${token.borderRadiusSM}px;

    color: ${token.colorWarningText};

    background: ${token.colorWarningBg};
  `,
  item: css`
    cursor: pointer;
    padding: 12px;
    border-radius: ${token.borderRadiusLG}px;
    transition: background-color 0.2s ease;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  itemLoading: css`
    opacity: 0.6;
  `,
  meta: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    margin-block-end: 4px;

    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  snippet: css`
    line-height: 1.5;
    color: ${token.colorTextSecondary};
    word-break: break-word;
  `,
}));

const escapeRegExp = (value: string) => value.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');

const createSnippet = (content: string, keyword: string, padding = 48) => {
  const normalized = content.replaceAll(/\s+/g, ' ').trim();
  if (!normalized) return '';

  const lower = normalized.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lower.indexOf(lowerKeyword);

  if (index === -1) {
    return normalized.length > padding * 2 ? `${normalized.slice(0, padding * 2)}…` : normalized;
  }

  const start = Math.max(index - padding, 0);
  const end = Math.min(index + lowerKeyword.length + padding, normalized.length);

  const prefix = start > 0 ? '…' : '';
  const suffix = end < normalized.length ? '…' : '';

  return `${prefix}${normalized.slice(start, end)}${suffix}`;
};

const highlightKeyword = (snippet: string, keyword: string, className: string) => {
  if (!keyword) return snippet;

  const escaped = escapeRegExp(keyword);
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = snippet.split(regex);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span className={className} key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
};

interface SearchMessagesProps {
  keyword: string;
}

const SearchMessages = memo<SearchMessagesProps>(({ keyword }) => {
  const normalizedKeyword = keyword.trim();
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();
  const navigateToMessage = useMessageNavigator();

  const sessions = useSessionStore((s) => s.sessions);
  const sessionMetaMap = useMemo(() => {
    return new Map(sessions.map((session) => [session.id, session.meta]));
  }, [sessions]);

  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, size, setSize, isLoading, isValidating } =
    useSWRInfinite<MessageKeywordSearchResult>(
      (pageIndex, previousPageData) => {
        if (!normalizedKeyword) return null;

        if (previousPageData) {
          const { current, pageSize, total } = previousPageData.pagination;
          const fetched = (current + 1) * pageSize;
          if (fetched >= total) return null;
        }

        return [SEARCH_MESSAGES_KEY, normalizedKeyword, pageIndex] as const;
      },
      async ([, searchValue, pageIndex]) =>
        messageService.searchMessages(searchValue as string, {
          current: pageIndex as number,
          pageSize: PAGE_SIZE,
        }),
      {
        revalidateFirstPage: true,
      },
    );

  const pages = data ?? [];
  const results = useMemo(() => pages.flatMap((page) => page.data), [pages]);
  const total = pages[0]?.pagination.total ?? 0;
  const hasMore = results.length < total;
  const isEmpty = !isLoading && results.length === 0;
  const isLoadingMore = isValidating && results.length > 0;

  if (!normalizedKeyword) return null;

  if (isEmpty) return null;

  return (
    <Flexbox className={styles.container} gap={8}>
      <div className={styles.header}>
        <Text type={'secondary'}>{t('searchMessages.title')}</Text>
        {total > 0 && <Text type={'secondary'}>{t('searchMessages.count', { count: total })}</Text>}
      </div>
      {isLoading && results.length === 0 ? (
        <SkeletonList />
      ) : (
        <Flexbox gap={8}>
          {results.map(({ id, content, sessionId, topicId, threadId, createdAt }) => {
            const sessionKey = sessionId ?? INBOX_SESSION_ID;
            const meta = sessionMetaMap.get(sessionKey);
            const title =
              sessionKey === INBOX_SESSION_ID
                ? t('inbox.title')
                : meta?.title || t('defaultSession');
            const snippet = createSnippet(content || '', normalizedKeyword);
            const timestamp = createdAt ? dayjs(createdAt).format('YYYY/MM/DD HH:mm') : '';

            return (
              <Flexbox
                className={cx(styles.item, pendingId === id && styles.itemLoading)}
                gap={4}
                key={id}
                onClick={async () => {
                  setPendingId(id);
                  try {
                    await navigateToMessage({
                      messageId: id,
                      sessionId,
                      threadId,
                      topicId,
                    });
                  } finally {
                    setPendingId(null);
                  }
                }}
              >
                <div className={styles.meta}>
                  {title && <span>{title}</span>}
                  {timestamp && <span>{timestamp}</span>}
                </div>
                <div className={styles.snippet}>
                  {highlightKeyword(snippet, normalizedKeyword, styles.highlight)}
                </div>
              </Flexbox>
            );
          })}
        </Flexbox>
      )}
      {hasMore && (
        <Button
          block
          loading={isLoadingMore}
          onClick={() => {
            if (isLoadingMore) return;
            setSize(size + 1);
          }}
          variant={'text'}
        >
          {t('searchMessages.loadMore')}
        </Button>
      )}
    </Flexbox>
  );
});

SearchMessages.displayName = 'SessionSearchMessages';

export default SearchMessages;
