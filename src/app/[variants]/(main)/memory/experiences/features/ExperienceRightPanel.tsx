'use client';

import { Text } from '@lobehub/ui';
import { Steps } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import CateTag from '@/app/[variants]/(main)/memory/features/CateTag';
import DetailPanel from '@/app/[variants]/(main)/memory/features/DetailPanel';
import HashTags from '@/app/[variants]/(main)/memory/features/HashTags';
import HighlightedContent from '@/app/[variants]/(main)/memory/features/HighlightedContent';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import Time from '@/app/[variants]/(main)/memory/features/Time';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    font-size: 14px;
    line-height: 1.8;
    color: ${token.colorText};
    white-space: pre-wrap;
  `,
  stepsContainer: css`
    .ant-steps-item-content {
      min-height: auto;
    }

    .ant-steps-item-description {
      padding-block-end: 16px !important;
    }
  `,
}));

const ExperienceRightPanel = memo(() => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();
  const [experienceId] = useQueryState('experienceId', { clearOnDefault: true });
  const experiences = useUserMemoryStore((s) => s.experiences);

  const experience = useMemo(() => {
    if (!experienceId) return null;
    return experiences.find((e) => e.id === experienceId) || null;
  }, [experienceId, experiences]);

  if (!experience) return null;

  const steps = [
    {
      description: experience.situation,
      title: t('experience.steps.situation'),
    },
    {
      description: experience.reasoning,
      title: t('experience.steps.reasoning'),
    },
    {
      description: experience.action,
      title: t('experience.steps.action'),
    },
    {
      description: experience.possibleOutcome,
      title: t('experience.steps.outcome'),
    },
  ].filter((step) => step.description);

  return (
    <DetailPanel>
      <CateTag cate={experience.type} />
      <Text
        as={'h1'}
        fontSize={20}
        style={{
          lineHeight: 1.4,
          marginBottom: 0,
        }}
        weight={'bold'}
      >
        {experience.title}
      </Text>
      <Flexbox align="center" gap={16} horizontal justify="space-between">
        <ProgressIcon
          format={(percent) => `Confidence: ${percent}%`}
          percent={(experience.scoreConfidence ?? 0) * 100}
          showInfo
        />
      </Flexbox>
      <Flexbox align="center" gap={16} horizontal justify="space-between">
        <SourceLink source={experience.source} />
        <Time updatedAt={experience.createdAt} />
      </Flexbox>

      {experience.keyLearning && <HighlightedContent>{experience.keyLearning}</HighlightedContent>}

      {steps.length > 0 && (
        <Steps
          className={styles.stepsContainer}
          current={steps.length}
          direction="vertical"
          items={steps.map((step) => ({
            description: <div className={styles.content}>{step.description}</div>,
            title: step.title,
          }))}
          size="small"
        />
      )}

      <HashTags hashTags={experience.tags} />
    </DetailPanel>
  );
});

export default ExperienceRightPanel;
