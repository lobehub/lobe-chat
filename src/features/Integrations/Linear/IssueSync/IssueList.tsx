'use client';

import type { LinearIssuePage, LinearIssueSummary } from '@lobechat/types';
import { Button, Checkbox, Empty, Flexbox, Skeleton, Tag, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWRInfinite from 'swr/infinite';

import { type LinearIssueFilterParams, linearService } from '@/services/linear';

import { linearKeys } from '../swrKeys';
import { linearSyncErrorMessage } from './utils';

const styles = stylex.create({
  identifier: {
    color: cssVar.colorTextSecondary,
    flexShrink: 0,
    fontFamily: cssVar.fontFamilyCode,
    fontSize: 12,
    width: 72,
  },
  list: {
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: cssVar.borderRadiusLG,
    borderStyle: 'solid',
    borderWidth: 1,
    maxHeight: 360,
    overflowY: 'auto',
  },
  row: {
    borderBlockEndColor: cssVar.colorBorderSecondary,
    borderBlockEndStyle: 'solid',
    borderBlockEndWidth: 1,
    paddingBlock: 8,
    paddingInline: 12,
  },
  title: {
    flex: '1',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

interface IssueListProps {
  disabled?: boolean;
  filter: LinearIssueFilterParams;
  onSelectionChange: (ids: string[], selected: boolean) => void;
  selected: Set<string>;
}

/** The issues matching the filter, pick-able one by one, newest activity first. */
const IssueList = memo<IssueListProps>(({ disabled, filter, onSelectionChange, selected }) => {
  const { t } = useTranslation('integration');

  const { data, error, isLoading, isValidating, setSize, size } = useSWRInfinite(
    (index: number, previous: LinearIssuePage | null) => {
      if (previous && !previous.hasMore) return null;
      return [...linearKeys.issues(filter), index === 0 ? null : previous?.cursor] as const;
    },
    ([, , , , , cursor]) => linearService.listIssues({ ...filter, cursor: cursor ?? undefined }),
    { revalidateFirstPage: false, revalidateOnFocus: false },
  );

  if (error) {
    return (
      <Text style={{ fontSize: 13 }} type="danger">
        {linearSyncErrorMessage(error, t)}
      </Text>
    );
  }
  if (isLoading || !data) return <Skeleton height={160} />;

  const issues: LinearIssueSummary[] = data.flatMap((page) => page.issues ?? []);
  if (issues.length === 0) {
    return <Empty description={t('linear.sync.list.empty')} />;
  }

  const ids = issues.map((issue) => issue.id);
  const allSelected = ids.every((id) => selected.has(id));
  const hasMore = data.at(-1)?.hasMore;

  return (
    <Flexbox gap={8}>
      <Flexbox horizontal align={'center'} justify={'space-between'}>
        <Checkbox
          checked={allSelected}
          disabled={disabled}
          indeterminate={!allSelected && ids.some((id) => selected.has(id))}
          onChange={(checked) => onSelectionChange(ids, checked)}
        >
          {t('linear.sync.list.selectAll', { count: issues.length })}
        </Checkbox>
        <Text style={{ fontSize: 13 }} type="secondary">
          {t('linear.sync.list.selected', { count: selected.size })}
        </Text>
      </Flexbox>
      <div {...stylex.props(styles.list)}>
        {issues.map((issue) => (
          <Flexbox
            horizontal
            align={'center'}
            gap={10}
            key={issue.id}
            {...stylex.props(styles.row)}
          >
            <Checkbox
              aria-label={issue.identifier}
              checked={selected.has(issue.id)}
              disabled={disabled}
              onChange={(checked) => onSelectionChange([issue.id], checked)}
            />
            <span {...stylex.props(styles.identifier)}>{issue.identifier}</span>
            <a
              href={issue.url}
              rel="noreferrer"
              target="_blank"
              title={issue.title}
              {...stylex.props(styles.title)}
            >
              <Text>{issue.title}</Text>
            </a>
            {issue.linkedTaskIdentifier ? (
              <Tag color={'success'}>
                {t('linear.sync.list.linked', { task: issue.linkedTaskIdentifier })}
              </Tag>
            ) : null}
            <Tag>{issue.stateName}</Tag>
          </Flexbox>
        ))}
      </div>
      {hasMore ? (
        <Button
          disabled={disabled}
          loading={isValidating && size > data.length}
          size={'small'}
          onClick={() => setSize(size + 1)}
        >
          {t('linear.sync.list.loadMore')}
        </Button>
      ) : null}
    </Flexbox>
  );
});

IssueList.displayName = 'LinearIssueList';

export default IssueList;
