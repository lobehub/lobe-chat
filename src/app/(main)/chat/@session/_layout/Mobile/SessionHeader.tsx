'use client';

import { ActionIcon, Logo, MobileNavBar } from '@lobehub/ui';
import { MessageSquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import SyncStatusInspector from '@/features/SyncStatusInspector';
import UserAvatar from '@/features/User/UserAvatar';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { mobileHeaderSticky } from '@/styles/mobileHeader';

const Header = memo(() => {
  const [createSession] = useSessionStore((s) => [s.createSession]);
  const router = useRouter();
  const { showCreateSession, enableWebrtc } = useServerConfigStore(featureFlagsSelectors);

  return (
    <MobileNavBar
      center={<Logo type={'text'} />}
      left={<UserAvatar onClick={() => router.push('/me')} size={32} />}
      right={
        <>
          {enableWebrtc && <SyncStatusInspector mobile />}
          {showCreateSession && (
            <ActionIcon
              icon={MessageSquarePlus}
              onClick={() => createSession()}
              size={MOBILE_HEADER_ICON_SIZE}
            />
          )}
        </>
      }
      style={mobileHeaderSticky}
    />
  );
});

export default Header;
