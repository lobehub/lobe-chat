import type { MeetingActionItem, MeetingDecision } from '@lobechat/types';
import { createStaticStyles, cssVar, Flexbox, Icon, Markdown, Tag, Text } from '@lobehub/ui';
import { CircleCheckIcon, ListTodoIcon, PlayIcon, SparklesIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

import { formatClock } from '../format';

const styles = createStaticStyles(({ css }) => ({
  cite: css`
    cursor: pointer;

    display: inline-flex;
    gap: 2px;
    align-items: center;

    padding: 0;
    border: none;

    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: ${cssVar.colorTextTertiary};

    background: none;

    &:hover {
      color: ${cssVar.colorPrimary};
    }
  `,
  item: css`
    padding-block: 12px;
    border-block-start: 1px solid ${cssVar.colorBorderSecondary};

    &:first-child {
      padding-block-start: 0;
      border-block-start: none;
    }
  `,
  section: css`
    padding: 16px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
  `,
}));

interface MinutesData {
  actionItems: MeetingActionItem[];
  decisions: MeetingDecision[];
  summary: string | null;
}

interface MinutesProps {
  minutes: MinutesData | null;
  onSeek: (ms: number) => void;
  /** Start offset of each transcript segment, for the citations. */
  segmentStarts: Map<string, number>;
}

const Section = ({
  children,
  icon,
  testId,
  title,
}: {
  children: ReactNode;
  icon: typeof SparklesIcon;
  testId: string;
  title: string;
}) => (
  <Flexbox className={styles.section} data-testid={testId} gap={12}>
    <Flexbox horizontal align={'center'} gap={8}>
      <Icon color={cssVar.colorTextSecondary} icon={icon} size={16} />
      <Text weight={600}>{title}</Text>
    </Flexbox>
    {children}
  </Flexbox>
);

const Citation = ({
  onSeek,
  segmentIds,
  segmentStarts,
}: {
  onSeek: (ms: number) => void;
  segmentIds: string[];
  segmentStarts: Map<string, number>;
}) => {
  const { t } = useTranslation('meeting');
  const starts = segmentIds
    .map((id) => segmentStarts.get(id))
    .filter((ms): ms is number => ms !== undefined);
  if (starts.length === 0) return null;

  const first = Math.min(...starts);
  return (
    <button className={styles.cite} type={'button'} onClick={() => onSeek(first)}>
      <Icon icon={PlayIcon} size={12} />
      {t('minutes.jumpTo', { time: formatClock(first) })}
    </button>
  );
};

const ACTION_STATUS_COLOR = { created: 'success', dismissed: undefined, suggested: 'processing' };

const Minutes = ({ minutes, onSeek, segmentStarts }: MinutesProps) => {
  const { t } = useTranslation('meeting');
  const navigate = useWorkspaceAwareNavigate();
  const empty = <Text type={'secondary'}>{t('minutes.empty')}</Text>;

  if (!minutes)
    return (
      <Section icon={SparklesIcon} testId={'meeting-minutes'} title={t('minutes.title')}>
        <Text type={'secondary'}>{t('minutes.pending')}</Text>
      </Section>
    );

  return (
    <Flexbox gap={12}>
      <Section icon={SparklesIcon} testId={'meeting-minutes-summary'} title={t('minutes.summary')}>
        {minutes.summary ? (
          <Markdown fontSize={14} variant={'chat'}>
            {minutes.summary}
          </Markdown>
        ) : (
          empty
        )}
      </Section>
      <Section
        icon={CircleCheckIcon}
        testId={'meeting-minutes-decisions'}
        title={t('minutes.decisions')}
      >
        {minutes.decisions.length === 0
          ? empty
          : minutes.decisions.map((decision, index) => (
              <Flexbox className={styles.item} gap={4} key={index}>
                <Text>{decision.text}</Text>
                <Citation
                  segmentIds={decision.segmentIds}
                  segmentStarts={segmentStarts}
                  onSeek={onSeek}
                />
              </Flexbox>
            ))}
      </Section>
      <Section
        icon={ListTodoIcon}
        testId={'meeting-minutes-action-items'}
        title={t('minutes.actionItems')}
      >
        {minutes.actionItems.length === 0
          ? empty
          : minutes.actionItems.map((item) => (
              <Flexbox className={styles.item} gap={6} key={item.id}>
                <Flexbox horizontal align={'flex-start'} gap={8} justify={'space-between'}>
                  <Text style={{ minWidth: 0 }}>{item.text}</Text>
                  <Tag color={ACTION_STATUS_COLOR[item.status]} size={'small'}>
                    {t(`actionItem.status.${item.status}`)}
                  </Tag>
                </Flexbox>
                <Flexbox horizontal align={'center'} gap={12} wrap={'wrap'}>
                  {item.assigneeHint && (
                    <Text fontSize={12} type={'secondary'}>
                      {t('actionItem.assignee', { name: item.assigneeHint })}
                    </Text>
                  )}
                  {item.dueDate && (
                    <Text fontSize={12} type={'secondary'}>
                      {t('actionItem.due', { date: item.dueDate })}
                    </Text>
                  )}
                  <Citation
                    segmentIds={item.segmentIds}
                    segmentStarts={segmentStarts}
                    onSeek={onSeek}
                  />
                  {item.taskId && (
                    <button
                      className={styles.cite}
                      type={'button'}
                      onClick={() => navigate(`/task/${item.taskId}`)}
                    >
                      {t('actionItem.openTask')}
                    </button>
                  )}
                </Flexbox>
              </Flexbox>
            ))}
      </Section>
    </Flexbox>
  );
};

export default Minutes;
