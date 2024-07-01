'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import ToolList from './features/Tools/ToolList';
import ToolUI from './features/Tools/ToolUI';

const Inspector = memo(() => {
  const showToolUI = useChatStore(chatPortalSelectors.showToolUI);

  return <Flexbox height={'100%'}>{showToolUI ? <ToolUI /> : <ToolList />}</Flexbox>;
});

export default Inspector;
