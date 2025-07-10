'use client';

import { ChatHeader } from '@lobehub/ui/chat';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import HeaderAction from './HeaderAction';
import Main from './Main';

const Header = () => {
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);

  return (
    showHeader && (
      <ChatHeader
        left={<Main />}
        right={<HeaderAction />}
        style={{ paddingInline: 8, position: 'initial', zIndex: 11 }}
      />
    )
  );
};

export default Header;
