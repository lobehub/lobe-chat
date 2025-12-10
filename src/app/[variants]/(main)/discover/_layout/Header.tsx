import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isCustomBranding } from '@/const/version';
import NavHeader from '@/features/NavHeader';

import CreateButton from '../features/CreateButton';
import StoreSearchBar from '../features/Search';
import UserAvatar from '../features/UserAvatar';

const Header = memo(() => {
  const theme = useTheme();
  return (
    <NavHeader
      right={
        <Flexbox align="center" gap={8} horizontal>
          {!isCustomBranding && <CreateButton />}
          <UserAvatar />
        </Flexbox>
      }
      style={{
        background: theme.colorBgContainerSecondary,
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
        position: 'relative',
        zIndex: 10,
      }}
      styles={{
        center: { flex: 1, maxWidth: 720 },
        left: { flex: 1, maxWidth: 120 },
        right: { flex: 1, maxWidth: 160 },
      }}
    >
      <StoreSearchBar />
    </NavHeader>
  );
});

export default Header;
