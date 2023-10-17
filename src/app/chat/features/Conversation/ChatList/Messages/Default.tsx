import { RenderMessage } from '@lobehub/ui';
import { memo } from 'react';

export const DefautMessage: RenderMessage = memo(({ id, editableContent }) => {
  return <div id={id}>{editableContent}</div>;
});
