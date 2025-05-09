'use client';

import { ChatHeader } from '@lobehub/ui/chat';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { electronStylish } from '@/styles/electron';

import HeaderAction from './HeaderAction';
import Main from './Main';

const Header = () => {
  const showHeader = useGlobalStore(systemStatusSelectors.showChatHeader);

  return (
    showHeader && (
      <ChatHeader
        className={electronStylish.draggable}
        left={<Main className={electronStylish.nodrag} />}
        right={<HeaderAction className={electronStylish.nodrag} />}
        style={{ paddingInline: 8, position: 'initial', zIndex: 11 }}
      />
    )
  );
};

export default Header;
