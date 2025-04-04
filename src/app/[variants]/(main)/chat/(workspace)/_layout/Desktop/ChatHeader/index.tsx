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
        left={
          <div className={electronStylish.nodrag}>
            <Main />
          </div>
        }
        right={
          <div className={electronStylish.nodrag}>
            <HeaderAction />
          </div>
        }
        style={{ height: 48, minHeight: 48, paddingInline: 8, position: 'initial', zIndex: 11 }}
      />
    )
  );
};

export default Header;
