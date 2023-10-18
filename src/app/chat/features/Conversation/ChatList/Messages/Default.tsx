import { RenderMessage } from '@lobehub/ui';
import { memo } from 'react';

import { LOADING_FLAT } from '@/const/message';

import BubblesLoading from '../Loading';

export const DefaultMessage: RenderMessage = memo(({ id, editableContent, content }) => {
  if (content === LOADING_FLAT) return <BubblesLoading />;

  return <div id={id}>{editableContent}</div>;
});
