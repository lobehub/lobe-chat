import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useTokenCount } from '@/hooks/useTokenCount';

const useStyles = createStyles(
  ({ css, token }) => css`
    padding: 2px 5px;

    font-size: 12px;
    line-height: 1;
    color: ${token.colorBgLayout};

    background: ${token.colorText};
    border-radius: 12px;
  `,
);

const TokenTag = memo<{ systemRole: string }>(({ systemRole }) => {
  const { styles } = useStyles();
  const value = useTokenCount(systemRole);

  return <div className={styles}>{value}</div>;
});

export default TokenTag;
