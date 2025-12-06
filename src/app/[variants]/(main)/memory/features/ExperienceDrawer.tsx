import { Drawer, Steps, Tag } from 'antd';
import { createStyles } from 'antd-style';
import {
  Calendar,
  CircleDot,
  Cpu,
  FileText,
  MapPin,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayExperienceMemory } from '@/database/repositories/userMemory';

const useStyles = createStyles(({ css, token }) => ({
  confidence: css`
    display: flex;
    gap: 8px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  content: css`
    font-size: 14px;
    line-height: 1.8;
    color: ${token.colorText};
    white-space: pre-wrap;
  `,
  drawerTitle: css`
    display: inline-flex;
    gap: 8px;
    align-items: center;
  `,
  keyLearning: css`
    padding: 16px;
    border-inline-start: 3px solid ${token.colorPrimary};
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillQuaternary};
  `,
  keyLearningContent: css`
    font-size: 15px;
    line-height: 1.8;
    color: ${token.colorText};
  `,
  keyLearningHeader: css`
    margin-block-end: 8px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  metaInfo: css`
    padding-block: 12px;
    padding-inline: 16px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
  metaLabel: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  metaValue: css`
    font-size: 13px;
    color: ${token.colorText};
  `,
  sourceLink: css`
    display: inline-flex;
    gap: 4px;
    align-items: center;

    font-size: 13px;
    color: ${token.colorPrimary};

    &:hover {
      text-decoration: underline;
    }
  `,
  stepsContainer: css`
    .ant-steps-item-content {
      min-height: auto;
    }

    .ant-steps-item-description {
      padding-block-end: 16px !important;
    }
  `,
  tag: css`
    margin-inline-end: 8px;
  `,
  tagsContainer: css`
    padding-block-start: 16px;
    border-block-start: 1px solid ${token.colorBorderSecondary};
  `,
  typeTag: css`
    display: inline-flex;
    gap: 6px;
    align-items: center;

    padding-block: 4px;
    padding-inline: 10px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorPrimary};

    background: ${token.colorPrimaryBg};
  `,
}));

const getTypeIcon = (type: string | null): ReactNode => {
  const iconSize = 16;
  switch (type?.toLowerCase()) {
    case 'activity': {
      return <Zap size={iconSize} />;
    }
    case 'context': {
      return <MessageSquare size={iconSize} />;
    }
    case 'event': {
      return <Calendar size={iconSize} />;
    }
    case 'fact': {
      return <FileText size={iconSize} />;
    }
    case 'location': {
      return <MapPin size={iconSize} />;
    }
    case 'people': {
      return <Users size={iconSize} />;
    }
    case 'preference': {
      return <Settings size={iconSize} />;
    }
    case 'technology': {
      return <Cpu size={iconSize} />;
    }
    case 'topic': {
      return <Sparkles size={iconSize} />;
    }
    default: {
      return <CircleDot size={iconSize} />;
    }
  }
};

interface ExperienceDrawerProps {
  experience: DisplayExperienceMemory | null;
  onClose: () => void;
  open: boolean;
}

const ExperienceDrawer = memo<ExperienceDrawerProps>(({ experience, open, onClose }) => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();

  if (!experience) return null;

  const tags = Array.isArray(experience.tags) ? experience.tags : [];
  const typeLabel = experience.type || t('experience.defaultType');

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
    <Drawer
      onClose={onClose}
      open={open}
      title={
        <span className={styles.drawerTitle}>
          {getTypeIcon(experience.type)}
          {typeLabel}
        </span>
      }
      width={480}
    >
      <Flexbox gap={24}>
        {experience.keyLearning && (
          <div className={styles.keyLearning}>
            <div className={styles.keyLearningHeader}>{t('experience.keyLearning')}</div>
            <div className={styles.keyLearningContent}>{experience.keyLearning}</div>
          </div>
        )}

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

        {tags.length > 0 && (
          <div className={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <Tag className={styles.tag} key={index}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </Flexbox>
    </Drawer>
  );
});

export default ExperienceDrawer;
