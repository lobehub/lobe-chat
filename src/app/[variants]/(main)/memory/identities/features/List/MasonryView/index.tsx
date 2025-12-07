import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { UserMemoryIdentity } from '@/types/index';

import { MasonryView as GenericMasonryView } from '../../../../features/MasonryView';
import MemoryCard from './MemoryCard';

const useStyles = createStyles(({ css, token }) => ({
  listItemMeta: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
}));

interface MasonryViewProps {
  identities: UserMemoryIdentity[];
}

const MasonryView = memo<MasonryViewProps>(({ identities }) => {
  const { styles } = useStyles();

  return (
    <GenericMasonryView
      defaultColumnCount={3}
      items={identities}
      renderItem={(identity) => {
        const labels = Array.isArray(identity.tags) ? identity.tags : [];

        return (
          <MemoryCard
            content={
              <Flexbox gap={8}>
                {identity.description && <div>{identity.description}</div>}
                <Flexbox gap={4} horizontal wrap="wrap">
                  {identity.role && (
                    <span className={styles.listItemMeta}>角色: {identity.role}</span>
                  )}
                  {identity.relationship && (
                    <span className={styles.listItemMeta}>关系: {identity.relationship}</span>
                  )}
                </Flexbox>
              </Flexbox>
            }
            footer={
              identity.episodicDate && (
                <div className={styles.listItemMeta}>
                  {dayjs(identity.episodicDate).format('YYYY-MM-DD')}
                </div>
              )
            }
            labels={labels}
            title={identity.type || '身份'}
            type="Identity"
          />
        );
      }}
    />
  );
});

export default MasonryView;
