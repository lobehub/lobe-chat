'use client';

import { ChatHeader } from '@lobehub/ui';
import { LobeChat } from '@lobehub/ui/brand';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';

import CreateButton from '../../features/CreateButton';
import StoreSearchBar from '../../features/StoreSearchBar';

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
        <Link href={'/discover'}>
          <LobeChat className={styles.logo} extra={'Discover'} size={36} type={'text'} />
        </Link>
      }
      right={<CreateButton />}
      style={{
        position: 'relative',
        zIndex: 10,
      }}
      styles={{
        center: { flex: 1, maxWidth: 1440 },
        left: { flex: 1, maxWidth: 240 },
        right: { flex: 1, maxWidth: 240 },
      }}
    >
      <StoreSearchBar />
    </ChatHeader>
  );
});

export default Header;
