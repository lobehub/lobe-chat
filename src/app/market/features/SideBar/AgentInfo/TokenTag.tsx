import { createStyles } from 'antd-style';
import { encode } from 'gpt-tokenizer';
import { memo, useMemo } from 'react';

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
  const value = useMemo(() => encode(systemRole).length, [systemRole]);

  return <div className={styles}>{value}</div>;
});

export default TokenTag;
