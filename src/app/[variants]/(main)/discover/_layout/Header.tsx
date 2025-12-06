import { useTheme } from 'antd-style';
import { memo } from 'react';

import { isCustomBranding } from '@/const/version';
import NavHeader from '@/features/NavHeader';

import CreateButton from '../features/CreateButton';
import StoreSearchBar from '../features/Search';

const Header = memo(() => {
  const theme = useTheme();
  return (
    <NavHeader
      right={!isCustomBranding && <CreateButton />}
      style={{
        background: theme.colorBgContainerSecondary,
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
        position: 'relative',
        zIndex: 10,
      }}
      styles={{
        center: { flex: 1, maxWidth: 720 },
        left: { flex: 1, maxWidth: 120 },
        right: { flex: 1, maxWidth: 120 },
      }}
    >
      <StoreSearchBar />
    </NavHeader>
  );
});

export default Header;
