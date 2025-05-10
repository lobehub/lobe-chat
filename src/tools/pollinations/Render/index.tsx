import { memo } from 'react';

import { BuiltinRenderProps } from '@/types/tool';
import { DallEImageItem } from '@/types/tool/dalle';

import Item from './Item';
import ToolBar from './ToolBar';

export interface PollinationsRenderProps extends BuiltinRenderProps<string> {}

const Render = memo<PollinationsRenderProps>(({ content, messageId }) => {
  let data: DallEImageItem[] = [];

  try {
    data = JSON.parse(content);
  } catch {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <Item key={index} data={item} index={index} messageId={messageId} />
        ))}
      </div>
      <ToolBar data={data} messageId={messageId} />
    </div>
  );
});

export default Render;
