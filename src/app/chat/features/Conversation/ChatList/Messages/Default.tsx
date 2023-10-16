import { RenderMessage } from '@lobehub/ui';
import { memo } from 'react';

export const DefautMessage: RenderMessage = memo(({ id, content }) => {
  return <div id={id}>{content}</div>;
});
