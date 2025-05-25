'use client';

import { ChatHeader } from '@lobehub/ui/chat';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

const Header = () => {
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);

  return showHeader && <ChatHeader style={{ paddingInline: 8, position: 'initial', zIndex: 11 }} />;
};

export default Header;
