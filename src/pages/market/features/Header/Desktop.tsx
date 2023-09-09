import { ChatHeader, Logo } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';

import AgentSearchBar from '../AgentSearchBar';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    color: ${token.colorText};
    fill: ${token.colorText};
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();

  return (
    <ChatHeader
      left={
        <Link href={'/'}>
          <Logo className={styles.logo} extra={'Discover'} size={36} type={'text'} />
        </Link>
      }
      right={<AgentSearchBar />}
    />
  );
});

export default Header;
