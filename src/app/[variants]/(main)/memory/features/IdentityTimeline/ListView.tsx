import type { UserMemoryIdentity } from '@lobechat/types';
import { Grid } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import MemoryCard from '../MemoryCard';

const useStyles = createStyles(({ css, token }) => ({
  listItemMeta: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
}));

interface ListViewProps {
  identities: UserMemoryIdentity[];
  mobile?: boolean;
}

const ListView = memo<ListViewProps>(({ identities, mobile }) => {
  const { styles } = useStyles();

  const sortedIdentities = useMemo(() => {
    return [...identities].sort((a, b) => {
      const dateA = a.episodicDate || a.createdAt;
      const dateB = b.episodicDate || b.createdAt;
      return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
    });
  }, [identities]);

  return (
    <Grid gap={16} rows={mobile ? 1 : 3}>
      {sortedIdentities.map((identity) => {
        const labels = (
          Array.isArray(identity.extractedLabels) ? identity.extractedLabels : []
        ) as string[];

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
            key={identity.id}
            labels={labels}
            title={identity.type || '身份'}
            type="Identity"
          />
        );
      })}
    </Grid>
  );
});

export default ListView;
