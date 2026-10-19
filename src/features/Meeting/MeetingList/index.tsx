'use client';

import { Block, Button, createStaticStyles, cssVar, Empty, Flexbox, Icon, Text } from '@lobehub/ui';
import dayjs from 'dayjs';
import { AudioLinesIcon, ChevronRightIcon, RefreshCwIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import type { MeetingListItem } from '@/services/meeting';
import { meetingActions, meetingSelectors, useMeetingStore } from '@/store/meeting';

import { formatClock } from '../format';
import { meetingDetailPath } from '../paths';
import MeetingStatusTag from '../StatusTag';

const ListSkeleton = createSurfaceSkeleton('list');

const styles = createStaticStyles(({ css }) => ({
  count: css`
    padding-block: 1px;
    padding-inline: 6px;
    border-radius: 99px;

    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextSecondary};

    background: ${cssVar.colorFillTertiary};
  `,
  meta: css`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextTertiary};
  `,
  row: css`
    cursor: pointer;

    padding-block: 12px;
    padding-inline: 16px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};

    transition: background 120ms ease;

    &:last-child {
      border-block-end: none;
    }

    &:hover,
    &:focus-visible {
      background: ${cssVar.colorFillQuaternary};
    }
  `,
  rows: css`
    overflow: hidden;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
  `,
  title: css`
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

const MeetingRow = ({ meeting }: { meeting: MeetingListItem }) => {
  const navigate = useWorkspaceAwareNavigate();
  const open = () => navigate(meetingDetailPath(meeting.id));

  return (
    <Flexbox
      horizontal
      align={'center'}
      className={styles.row}
      gap={12}
      role={'link'}
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter') open();
      }}
    >
      <Flexbox flex={1} gap={4} style={{ minWidth: 0 }}>
        <Flexbox horizontal align={'center'} gap={8}>
          <Text className={styles.title} weight={500}>
            {meeting.title}
          </Text>
          <MeetingStatusTag status={meeting.status} />
        </Flexbox>
        <span className={styles.meta}>
          {dayjs(meeting.startedAt).format('YYYY-MM-DD HH:mm')}
          {meeting.durationMs ? ` · ${formatClock(meeting.durationMs)}` : ''}
        </span>
      </Flexbox>
      <Icon color={cssVar.colorTextQuaternary} icon={ChevronRightIcon} size={16} />
    </Flexbox>
  );
};

const MeetingListPage = () => {
  const { t } = useTranslation('meeting');
  const { error } = meetingActions.useFetchMeetings();
  const meetings = useMeetingStore(meetingSelectors.meetingList);

  const record = (
    <Button
      icon={AudioLinesIcon}
      size={'small'}
      type={'primary'}
      onClick={meetingActions.openRecorder}
    >
      {t('entry.record')}
    </Button>
  );

  return (
    <Flexbox height={'100%'} width={'100%'}>
      <NavHeader left={<Text weight={600}>{t('list.title')}</Text>} right={record} />
      <WideScreenContainer
        fullWidth
        flex={1}
        gap={16}
        paddingBlock={16}
        paddingInline={16}
        wrapperStyle={{ flex: 1, overflowY: 'auto' }}
      >
        {meetings === undefined ? (
          error ? (
            <Block padding={32} variant={'outlined'}>
              <Flexbox align={'center'} gap={12}>
                <Text weight={600}>{t('list.loadError.title')}</Text>
                <Text fontSize={13} type={'secondary'}>
                  {t('list.loadError.description')}
                </Text>
                <Button icon={RefreshCwIcon} onClick={() => void meetingActions.refreshMeetings()}>
                  {t('list.retry')}
                </Button>
              </Flexbox>
            </Block>
          ) : (
            <ListSkeleton chrome={'body'} />
          )
        ) : meetings.length === 0 ? (
          <Flexbox align={'center'} gap={16} paddingBlock={64}>
            <Empty
              description={t('list.empty.description')}
              icon={AudioLinesIcon}
              title={t('list.empty.title')}
            />
            <Button icon={AudioLinesIcon} type={'primary'} onClick={meetingActions.openRecorder}>
              {t('list.empty.action')}
            </Button>
          </Flexbox>
        ) : (
          <Flexbox gap={10}>
            <Flexbox horizontal align={'center'} gap={8}>
              <Text fontSize={16} weight={600}>
                {t('list.title')}
              </Text>
              <span className={styles.count}>{meetings.length}</span>
            </Flexbox>
            <div className={styles.rows}>
              {meetings.map((meeting) => (
                <MeetingRow key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </Flexbox>
        )}
      </WideScreenContainer>
    </Flexbox>
  );
};

export default MeetingListPage;
