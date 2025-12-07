'use client';

import { Drawer, Tag, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { Link2 } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DisplayContextMemory } from '@/database/repositories/userMemory';

const useStyles = createStyles(({ css, token }) => ({
  description: css`
    padding: 16px;
    border-inline-start: 3px solid ${token.colorPrimary};
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillQuaternary};
  `,
  descriptionContent: css`
    font-size: 15px;
    line-height: 1.8;
    color: ${token.colorText};
  `,
  descriptionHeader: css`
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
  scoreBar: css`
    display: flex;
    gap: 12px;
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
  status: css`
    padding-block: 6px;
    padding-inline: 12px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 13px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
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

interface ContextDrawerProps {
  context: DisplayContextMemory | null;
  onClose: () => void;
  open: boolean;
}

const ContextDrawer = memo<ContextDrawerProps>(({ context, open, onClose }) => {
  const { t } = useTranslation('memory');
  const { styles } = useStyles();

  if (!context) return null;

  const tags = Array.isArray(context.tags) ? context.tags : [];
  const source = context.source;

  // Use title if available, otherwise use type as fallback
  const drawerTitle = context.title || context.type || t('context.defaultType');

  return (
    <Drawer onClose={onClose} open={open} title={drawerTitle} width={480}>
      <Flexbox gap={24}>
        {/* Meta info: type, status, source, time */}
        <div className={styles.metaInfo}>
          <Flexbox gap={12}>
            <Flexbox align="center" gap={16} horizontal justify="space-between">
              {context.type && <span className={styles.typeTag}>{context.type}</span>}
              {context.currentStatus && (
                <span className={styles.status}>{context.currentStatus}</span>
              )}
            </Flexbox>

            <Flexbox align="center" gap={16} horizontal justify="space-between">
              {source && (
                <Flexbox align="center" gap={4} horizontal>
                  <span className={styles.metaLabel}>{t('context.source')}:</span>
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
              {context.createdAt && (
                <Tooltip title={dayjs(context.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                  <span className={styles.metaLabel}>{dayjs(context.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </Flexbox>

            {/* Score bars */}
            <Flexbox align="center" gap={16} horizontal>
              {context.scoreImpact !== null && context.scoreImpact !== undefined && (
                <div className={styles.scoreBar}>
                  <Tag color="blue">
                    {t('context.impact')}: {((context.scoreImpact ?? 0) * 100).toFixed(0)}%
                  </Tag>
                </div>
              )}
              {context.scoreUrgency !== null && context.scoreUrgency !== undefined && (
                <div className={styles.scoreBar}>
                  <Tag color={(context.scoreUrgency ?? 0) >= 0.7 ? 'red' : 'orange'}>
                    {t('context.urgency')}: {((context.scoreUrgency ?? 0) * 100).toFixed(0)}%
                  </Tag>
                </div>
              )}
            </Flexbox>
          </Flexbox>
        </div>

        {/* Description */}
        {context.description && (
          <div className={styles.description}>
            <div className={styles.descriptionHeader}>{t('context.description')}</div>
            <div className={styles.descriptionContent}>{context.description}</div>
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

export default ContextDrawer;
