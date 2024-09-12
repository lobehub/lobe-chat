'use client';

import { ActionIcon, MobileNavBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { SearchIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

import StoreSearchBar from '../../../features/StoreSearchBar';
import Nav from './Nav';

const useStyles = createStyles(({ css, token }) => ({
  search: css`
    position: absolute;
    z-index: 10;
    inset-block-start: 0;
    inset-inline: 0 0;

    background: ${token.colorBgLayout};
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <MobileNavBar
      center={
        showSearch && (
          <Flexbox align={'center'} className={styles.search} paddingBlock={8} paddingInline={16}>
            <StoreSearchBar mobile onBlur={() => setShowSearch(false)} />
          </Flexbox>
        )
      }
      contentStyles={{ center: { display: 'none' } }}
      left={<Nav />}
      right={
        showSearch ? (
          <Flexbox align={'center'} className={styles.search} paddingBlock={8} paddingInline={16}>
            <StoreSearchBar mobile onBlur={() => setShowSearch(false)} />
          </Flexbox>
        ) : (
          <ActionIcon
            icon={SearchIcon}
            onClick={() => setShowSearch(true)}
            size={MOBILE_HEADER_ICON_SIZE}
          />
        )
      }
      style={{
        ...mobileHeaderSticky,
        overflow: 'unset',
      }}
    />
  );
});

export default Header;
