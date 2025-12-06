import { Drawer, Progress, Tag, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import {
  AlertCircle,
  BookOpen,
  CircleDot,
  Code2,
  Heart,
  Lightbulb,
  Link2,
  Settings,
  Utensils,
} from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayPreferenceMemory } from '@/database/repositories/userMemory';

const useStyles = createStyles(({ css, token }) => ({
  conclusionDirectives: css`
    padding: 16px;
    border-inline-start: 3px solid ${token.colorPrimary};
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillQuaternary};
  `,
  conclusionDirectivesContent: css`
    font-size: 15px;
    line-height: 1.8;
    color: ${token.colorText};
  `,
  conclusionDirectivesHeader: css`
    margin-block-end: 8px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  drawerTitle: css`
    display: inline-flex;
    gap: 8px;
    align-items: center;
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
  priority: css`
    display: flex;
    gap: 8px;
    align-items: center;

    font-size: 12px;
    color: ${token.colorTextSecondary};
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
  suggestions: css`
    padding: 16px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillTertiary};
  `,
  suggestionsContent: css`
    font-size: 14px;
    line-height: 1.8;
    color: ${token.colorTextSecondary};
    white-space: pre-wrap;
  `,
  suggestionsHeader: css`
    display: flex;
    gap: 6px;
    align-items: center;

    margin-block-end: 8px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
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
    case 'coding': {
      return <Code2 size={iconSize} />;
    }
    case 'communication': {
      return <BookOpen size={iconSize} />;
    }
    case 'food': {
      return <Utensils size={iconSize} />;
    }
    case 'health': {
      return <Heart size={iconSize} />;
    }
    case 'preference': {
      return <Settings size={iconSize} />;
    }
    case 'warning': {
      return <AlertCircle size={iconSize} />;
    }
    default: {
      return <CircleDot size={iconSize} />;
    }
  }
};

interface PreferenceDrawerProps {
  onClose: () => void;
  open: boolean;
  preference: DisplayPreferenceMemory | null;
}

const PreferenceDrawer = memo<PreferenceDrawerProps>(({ preference, open, onClose }) => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();

  if (!preference) return null;

  const tags = Array.isArray(preference.tags) ? preference.tags : [];
  const priority = preference.scorePriority ?? 0;
  const source = preference.source;

  // Use title if available, otherwise use type as fallback
  const drawerTitle = preference.title || preference.type || t('preference.defaultType');

  return (
    <Drawer onClose={onClose} open={open} title={drawerTitle} width={480}>
      <Flexbox gap={24}>
        {/* Meta info: type, priority, source, time */}
        <div className={styles.metaInfo}>
          <Flexbox gap={12}>
            <Flexbox align="center" gap={16} horizontal justify="space-between">
              {preference.type && (
                <span className={styles.typeTag}>
                  {getTypeIcon(preference.type)}
                  {preference.type}
                </span>
              )}
              <div className={styles.priority}>
                <span>{t('preference.priority')}:</span>
                <Progress
                  percent={Math.round(priority * 100)}
                  showInfo={false}
                  size="small"
                  style={{ width: 60 }}
                />
                <span>{(priority * 100).toFixed(0)}%</span>
              </div>
            </Flexbox>

            <Flexbox align="center" gap={16} horizontal justify="space-between">
              {source && (
                <Flexbox align="center" gap={4} horizontal>
                  <span className={styles.metaLabel}>{t('preference.source')}:</span>
                  <Tooltip title={source.topicTitle || `Topic: ${source.topicId}`}>
                    <Link
                      className={styles.sourceLink}
                      href={`/agent/${source.agentId}?topicId=${source.topicId}`}
                    >
                      <Link2 size={14} />
                      {source.topicTitle || source.topicId.replace('tpc_', '').slice(0, 8)}
                    </Link>
                  </Tooltip>
                </Flexbox>
              )}
              {preference.createdAt && (
                <Tooltip title={dayjs(preference.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                  <span className={styles.metaLabel}>{dayjs(preference.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </Flexbox>
          </Flexbox>
        </div>

        {/* Conclusion Directives */}
        {preference.conclusionDirectives && (
          <div className={styles.conclusionDirectives}>
            <div className={styles.conclusionDirectivesHeader}>
              {t('preference.conclusionDirectives')}
            </div>
            <div className={styles.conclusionDirectivesContent}>
              {preference.conclusionDirectives}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {preference.suggestions && (
          <div className={styles.suggestions}>
            <div className={styles.suggestionsHeader}>
              <Lightbulb size={14} />
              {t('preference.suggestions')}
            </div>
            <div className={styles.suggestionsContent}>{preference.suggestions}</div>
          </div>
        )}

        {/* Tags */}
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

export default PreferenceDrawer;
