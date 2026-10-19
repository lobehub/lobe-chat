'use client';

import { ActionIcon, Flexbox } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/mobile';
import { MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router';

import { ProductLogo } from '@/components/Branding';
import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import UserAvatar from '@/features/User/UserAvatar';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

import { useCreateAgent } from '../useCreateAgent';
import { styles } from './SessionHeader/style';

const Header = memo(() => {
  const { create } = useCreateAgent();
  const navigate = useNavigate();

  return (
    <ChatHeader
      style={mobileHeaderSticky}
      left={
        <Flexbox horizontal align={'center'} className={styles.leftContainer} gap={8}>
          <UserAvatar size={32} onClick={() => navigate('/me')} />
          <ProductLogo type={'text'} />
        </Flexbox>
      }
      right={
        <ActionIcon
          icon={MessageSquarePlus}
          size={MOBILE_HEADER_ICON_SIZE}
          onClick={() => create()}
        />
      }
    />
  );
});

export default Header;
