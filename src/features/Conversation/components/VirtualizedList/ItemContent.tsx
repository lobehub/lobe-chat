'use client';

import { memo } from 'react';

import { WELCOME_GUIDE_CHAT_ID } from '@/const/session';

import Item from '../ChatItem';
import InboxWelcome from '../InboxWelcome';

const ItemContent = memo<{ id: string; index: number; mobile?: boolean }>(
  ({ index, id, mobile }) => {
    if (id === WELCOME_GUIDE_CHAT_ID) return <InboxWelcome />;

    return index === 0 ? (
      <div style={{ height: 24 + (mobile ? 0 : 64) }} />
    ) : (
      <Item id={id} index={index - 1} />
    );
  },
);

export default ItemContent;
