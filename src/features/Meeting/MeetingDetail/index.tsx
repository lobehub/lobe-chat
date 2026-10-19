'use client';

import {
  Block,
  Button,
  createStaticStyles,
  cssVar,
  Flexbox,
  Icon,
  Switch,
  Text,
} from '@lobehub/ui';
import dayjs from 'dayjs';
import { ChevronLeftIcon, RefreshCwIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import NavHeader from '@/features/NavHeader';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import type { MeetingDetail } from '@/services/meeting';
import {
  isMeetingProcessing,
  meetingActions,
  meetingSelectors,
  useMeetingStore,
} from '@/store/meeting';
import { isTrpcErrorCode } from '@/utils/trpcError';

import { findActiveSegment, formatClock } from '../format';
import { MEETING_LIST_PATH } from '../paths';
import MeetingStatusTag from '../StatusTag';
import AudioPlayer from './AudioPlayer';
import Minutes from './Minutes';
import { buildSpeakerViews } from './speakers';
import Transcript from './Transcript';
import { usePlayback } from './usePlayback';

const DetailSkeleton = createSurfaceSkeleton('detail');

const styles = createStaticStyles(({ css }) => ({
  body: css`
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    flex: 1;

    min-height: 0;

    @media (width <= 960px) {
      overflow-y: auto;
      grid-template-columns: minmax(0, 1fr);
    }
  `,
  breadcrumb: css`
    cursor: pointer;

    display: inline-flex;
    gap: 2px;
    align-items: center;

    padding: 0;
    border: none;

    font-size: 14px;
    color: ${cssVar.colorTextSecondary};

    background: none;

    &:hover {
      color: ${cssVar.colorText};
    }
  `,
  meta: css`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextTertiary};
  `,
  side: css`
    overflow-y: auto;
    padding: 16px;
    border-inline-start: 1px solid ${cssVar.colorBorderSecondary};

    @media (width <= 960px) {
      overflow-y: visible;
      border-inline-start: none;
    }
  `,
  transcript: css`
    overflow-y: auto;
    padding-block: 0 24px;
    padding-inline: 16px;

    @media (width <= 960px) {
      overflow-y: visible;
    }
  `,
  transcriptHeader: css`
    position: sticky;
    z-index: 1;
    inset-block-start: 0;

    padding-block: 16px 12px;

    background: ${cssVar.colorBgContainer};
  `,
}));

const MeetingBody = ({ meeting }: { meeting: MeetingDetail }) => {
  const { t } = useTranslation('meeting');
  const playback = usePlayback(meeting.durationMs);
  const [follow, setFollow] = useState(true);
  const { seek } = playback;

  const speakers = useMemo(
    () => buildSpeakerViews(meeting.speakers, (index) => t('detail.transcript.speaker', { index })),
    [meeting.speakers, t],
  );
  const segmentStarts = useMemo(
    () => new Map(meeting.segments.map((segment) => [segment.id, segment.startMs])),
    [meeting.segments],
  );
  const activeIndex = findActiveSegment(meeting.segments, playback.currentMs);
  const onSeek = useCallback((ms: number) => seek(ms), [seek]);

  const processing = isMeetingProcessing(meeting.status);
  const isDraft = meeting.segmentSource === 'realtime' && meeting.segments.length > 0;
  const audioHint = meeting.localAudioPath ? t('audio.local') : t('audio.unavailable');

  return (
    <div className={styles.body}>
      <div className={styles.transcript}>
        <Flexbox className={styles.transcriptHeader} gap={12}>
          <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
            <Flexbox gap={2}>
              <Text fontSize={20} weight={600}>
                {meeting.title}
              </Text>
              <span className={styles.meta}>
                {t('meta.startedAt')} {dayjs(meeting.startedAt).format('YYYY-MM-DD HH:mm')}
                {meeting.durationMs
                  ? ` · ${t('meta.duration')} ${formatClock(meeting.durationMs)}`
                  : ''}
              </span>
            </Flexbox>
            <Flexbox horizontal align={'center'} gap={6}>
              <Text fontSize={12} type={'secondary'}>
                {t('detail.followPlayback')}
              </Text>
              <Switch checked={follow} size={'small'} onChange={setFollow} />
            </Flexbox>
          </Flexbox>
          <AudioPlayer emptyHint={audioHint} playback={playback} src={meeting.audio?.url} />
          <Flexbox horizontal align={'center'} gap={8}>
            <Text weight={600}>{t('detail.transcript.title')}</Text>
            {isDraft && (
              <Text fontSize={12} type={'secondary'}>
                {t('detail.transcript.draftHint')}
              </Text>
            )}
          </Flexbox>
        </Flexbox>
        <Transcript
          activeIndex={activeIndex}
          follow={follow && playback.playing}
          segments={meeting.segments}
          speakers={speakers}
          unknownSpeaker={t('detail.transcript.unknownSpeaker')}
          emptyText={
            processing ? t('detail.transcript.emptyProcessing') : t('detail.transcript.empty')
          }
          onSeek={onSeek}
        />
      </div>
      <div className={styles.side}>
        <Minutes meeting={meeting} segmentStarts={segmentStarts} onSeek={onSeek} />
      </div>
    </div>
  );
};

const MeetingDetailPage = ({ meetingId }: { meetingId: string }) => {
  const { t } = useTranslation('meeting');
  const navigate = useWorkspaceAwareNavigate();
  const { error } = meetingActions.useFetchMeetingDetail(meetingId);
  const meeting = useMeetingStore(meetingSelectors.meetingDetail(meetingId));

  const notFound = !meeting && isTrpcErrorCode(error, 'NOT_FOUND');

  return (
    <Flexbox height={'100%'} width={'100%'}>
      <NavHeader
        right={meeting ? <MeetingStatusTag status={meeting.status} /> : undefined}
        left={
          <Flexbox horizontal align={'center'} gap={6}>
            <button
              className={styles.breadcrumb}
              type={'button'}
              onClick={() => navigate(MEETING_LIST_PATH)}
            >
              <Icon icon={ChevronLeftIcon} size={16} />
              {t('detail.back')}
            </button>
          </Flexbox>
        }
      />
      {meeting ? (
        <MeetingBody meeting={meeting} />
      ) : notFound ? (
        <Flexbox align={'center'} padding={48}>
          <Block padding={32} variant={'outlined'}>
            <Flexbox align={'center'} gap={8}>
              <Text weight={600}>{t('detail.notFound.title')}</Text>
              <Text fontSize={13} type={'secondary'}>
                {t('detail.notFound.description')}
              </Text>
            </Flexbox>
          </Block>
        </Flexbox>
      ) : error ? (
        <Flexbox align={'center'} padding={48}>
          <Block padding={32} variant={'outlined'}>
            <Flexbox align={'center'} gap={12}>
              <Text weight={600}>{t('detail.loadError')}</Text>
              <Button
                icon={RefreshCwIcon}
                onClick={() => void meetingActions.refreshMeetingDetail(meetingId)}
              >
                {t('list.retry')}
              </Button>
            </Flexbox>
          </Block>
        </Flexbox>
      ) : (
        <DetailSkeleton chrome={'body'} />
      )}
    </Flexbox>
  );
};

export default MeetingDetailPage;
