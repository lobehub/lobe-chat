import type { UserMemoryIdentity } from '@lobechat/types';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import IdentityCard from './IdentityCard';

const useStyles = createStyles(({ css, token }) => ({
  count: css`
    width: 18px;
    height: 18px;
    margin-inline-start: 8px;
    border-radius: 8px;

    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
    color: ${token.colorTextTertiary};

    background: ${token.colorFillTertiary};
  `,
  monthHeader: css`
    margin-block-end: 16px;
    margin-inline-start: -16px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
}));

interface MonthGroupProps {
  identities: UserMemoryIdentity[];
  monthKey: string;
}

const MonthGroup = memo<MonthGroupProps>(({ identities, monthKey }) => {
  const { styles } = useStyles();

  const [year, month] = monthKey.split('-');
  const monthName = dayjs(`${year}-${month}-01`).format('YYYY年MM月');

  const sortedIdentities = [...identities].sort((a, b) => {
    const dateA = a.episodicDate || a.createdAt;
    const dateB = b.episodicDate || b.createdAt;
    return dayjs(dateB).valueOf() - dayjs(dateA).valueOf();
  });

  return (
    <Flexbox gap={12}>
      <Flexbox align={'center'} className={styles.monthHeader} horizontal>
        {monthName}
        <Center className={styles.count}>{identities.length}</Center>
      </Flexbox>

      <Flexbox gap={8}>
        {sortedIdentities.map((identity) => (
          <IdentityCard identity={identity} key={identity.id} />
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default MonthGroup;
