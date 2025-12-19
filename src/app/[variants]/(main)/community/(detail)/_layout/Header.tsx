'use client';

import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ArrowLeft } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useLocation, useNavigate } from 'react-router-dom';

import StoreSearchBar from '@/app/[variants]/(main)/community/features/Search';
import UserAvatar from '@/app/[variants]/(main)/community/features/UserAvatar';
import NavHeader from '@/features/NavHeader';

const Header = memo(() => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the path segment (assistant, model, provider, mcp)
  const path = location.pathname.split('/').find(Boolean);

  const handleGoBack = () => {
    navigate(`/${path}`);
  };

  return (
    <NavHeader
      left={
        <Flexbox align={'center'} gap={8} horizontal>
          <ActionIcon icon={ArrowLeft} onClick={handleGoBack} size={'small'} />
          <StoreSearchBar />
        </Flexbox>
      }
      right={<UserAvatar />}
      style={{
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
      }}
      styles={{
        left: { flex: 1 },
      }}
    />
  );
});

export default Header;
