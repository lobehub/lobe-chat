import { ReactNode, memo } from 'react';

import { LOADING_FLAT } from '@/const/message';
import { ChatMessage } from '@/types/message';

import BubblesLoading from '../components/BubblesLoading';

export const GuideMessage = memo<
  ChatMessage & {
    editableContent: ReactNode;
  }
>(({ id, content }) => {
  if (content === LOADING_FLAT) return <BubblesLoading />;

  return <div id={id}>{content}</div>;
});
