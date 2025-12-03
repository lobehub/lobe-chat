import type { UserMemoryIdentity } from '@lobechat/types';
import { ActionIcon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { Pencil, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserMemoryStore } from '@/store/userMemory';

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    position: absolute;
    inset-block-end: 12px;
    inset-inline-end: 16px;

    opacity: 0;

    transition: opacity 0.15s ease;
  `,
  description: css`
    color: ${token.colorTextSecondary};
  `,
  label: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
  `,
  monthDot: css`
    position: absolute;
    inset-block-start: 16px;
    inset-inline-start: -20px;

    width: 8px;
    height: 8px;
    border: 2px solid ${token.colorBgContainer};
    border-radius: 50%;

    background: ${token.colorFill};
  `,
  monthLine: css`
    position: absolute;
    inset-block-start: 20px;
    inset-inline-start: -12px;

    width: 14px;
    height: 1px;

    background: ${token.colorBorderSecondary};
  `,
  relationship: css`
    display: inline-block;

    padding-block: 1px;
    padding-inline: 8px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 12px;
    color: ${token.colorTextTertiary};

    background: ${token.colorFillQuaternary};
  `,
  role: css`
    font-size: 13px;
    font-weight: 500;
    color: ${token.colorText};
  `,
  timelineCard: css`
    position: relative;

    padding-block: 12px;
    padding-inline: 16px;
    border-radius: ${token.borderRadius}px;

    background: ${token.colorBgContainer};

    transition: all 0.15s ease;

    &:hover {
      background: ${token.colorFillQuaternary};

      .actions {
        opacity: 1;
      }
    }
  `,
  type: css`
    display: inline-block;

    padding-block: 2px;
    padding-inline: 8px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 11px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
  `,
  updatedBadge: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
  `,
}));

interface IdentityCardProps {
  identity: UserMemoryIdentity;
}

const IdentityCard = memo<IdentityCardProps>(({ identity }) => {
  const { styles } = useStyles();
  const { modal } = App.useApp();
  const { t } = useTranslation('memory');
  const deleteIdentity = useUserMemoryStore((s) => s.deleteIdentity);

  const labels = (
    Array.isArray(identity.extractedLabels) ? identity.extractedLabels : []
  ) as string[];

  const isUpdated =
    identity.updatedAt &&
    identity.createdAt &&
    dayjs(identity.updatedAt).valueOf() !== dayjs(identity.createdAt).valueOf();

  const showRelationship = identity.relationship && identity.relationship !== 'self';

  const handleEdit = () => {
    // TODO: 实现编辑弹窗
    console.log('Edit identity:', identity.id);
  };

  const handleDelete = () => {
    modal.confirm({
      cancelText: t('identity.list.deleteCancel'),
      content: t('identity.list.deleteContent'),
      okButtonProps: {
        danger: true,
      },
      okText: t('identity.list.deleteOk'),
      onOk: async () => {
        await deleteIdentity(identity.id);
      },
      title: t('identity.list.confirmDelete'),
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.monthLine} />
      <div className={styles.monthDot} />

      <div className={styles.timelineCard}>
        <Flexbox gap={8}>
          <Flexbox gap={8} horizontal justify="space-between">
            <Flexbox gap={4} horizontal wrap="wrap">
              {identity.role && <span className={styles.role}>{identity.role}</span>}
              {showRelationship && (
                <span className={styles.relationship}>{identity.relationship}</span>
              )}
            </Flexbox>

            {identity.type && <span className={styles.type}>{identity.type}</span>}
          </Flexbox>

          {identity.description && <div className={styles.description}>{identity.description}</div>}

          {labels.length > 0 && (
            <Flexbox gap={6} horizontal wrap="wrap">
              {labels.map((label, index) => (
                <span className={styles.label} key={index}>
                  #{label}
                </span>
              ))}
            </Flexbox>
          )}

          {isUpdated && (
            <div className={styles.updatedBadge}>
              {dayjs(identity.updatedAt).format('YYYY-MM-DD')} {t('identity.list.updated')}
            </div>
          )}
        </Flexbox>

        <Flexbox className={`actions ${styles.actions}`} gap={4} horizontal>
          <ActionIcon icon={Pencil} onClick={handleEdit} size="small" />
          <ActionIcon icon={Trash2} onClick={handleDelete} size="small" />
        </Flexbox>
      </div>
    </div>
  );
});

export default IdentityCard;
