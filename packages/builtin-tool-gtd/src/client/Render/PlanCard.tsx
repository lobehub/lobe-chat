'use client';

import { Flexbox, Tag, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ClipboardList } from 'lucide-react';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';

import type { Plan } from '../../types';

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      cursor: pointer;

      overflow: hidden;

      width: 100%;
      padding-block: 12px;
      padding-inline: 12px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 8px;

      background: ${token.colorBgElevated};

      &:hover {
        background: ${token.colorFillSecondary};
      }
    `,
    description: css`
      font-size: 12px;
      line-height: 1.5;
      color: ${token.colorTextSecondary};
    `,
    icon: css`
      color: ${token.colorPrimary};
    `,
    title: css`
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;

      font-weight: 500;
      color: ${token.colorText};
    `,
    typeTag: css`
      font-size: 11px;
    `,
  };
});

interface PlanCardProps {
  plan: Plan;
}

const PlanCard = memo<PlanCardProps>(({ plan }) => {
  const { styles } = useStyles();
  const openDocument = useChatStore((s) => s.openDocument);

  const handleClick = () => {
    openDocument(plan.id);
  };

  return (
    <Flexbox className={styles.container} gap={8} onClick={handleClick}>
      <Flexbox align={'center'} gap={8} horizontal>
        <ClipboardList className={styles.icon} size={16} />
        <div className={styles.title}>{plan.goal}</div>
        <Tag className={styles.typeTag} size={'small'}>
          plan
        </Tag>
      </Flexbox>
      {plan.description && (
        <Text className={styles.description} ellipsis={{ rows: 2 }}>
          {plan.description}
        </Text>
      )}
    </Flexbox>
  );
});

export default PlanCard;
