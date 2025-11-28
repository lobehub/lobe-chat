'use client';

import { ChatHeader } from '@lobehub/ui/mobile';
import { memo, useState } from 'react';

import ShareButton from '@/app/[variants]/(main)/chat/features/Conversation/ChatHeader/ShareButton';
import SettingButton from '@/app/[variants]/(main)/chat/profile/Settings/features/SettingButton';
import { INBOX_SESSION_ID } from '@/const/session';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ChatHeaderTitle from './ChatHeaderTitle';

const MobileHeader = memo(() => {
  const router = useQueryRoute();
  const [open, setOpen] = useState(false);

  const { isAgentEditable } = useServerConfigStore(featureFlagsSelectors);

  return (
    <ChatHeader
      center={<ChatHeaderTitle />}
      onBackClick={() =>
        router.push('/agent', { query: { session: INBOX_SESSION_ID }, replace: true })
      }
      right={
        <>
          <ShareButton mobile open={open} setOpen={setOpen} />
          {isAgentEditable && <SettingButton mobile />}
        </>
      }
      showBackButton
      style={{ width: '100%' }}
    />
  );
});

export default MobileHeader;
