import { memo, useState } from 'react';

import { useChatStore } from '@/store/chat';
import { DallEImageItem } from '@/types/tool/dalle';

import EditMode from './EditMode';
import Image from './Image';

export interface ItemProps {
  data: DallEImageItem;
  index: number;
  messageId: string;
}

const Item = memo<ItemProps>(({ data, index, messageId }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const dalleImageLoading = useChatStore((s) => s.dalleImageLoading);

  const loading = dalleImageLoading[messageId + data.prompt];

  return (
    <div className="relative overflow-hidden rounded-lg">
      {isEditMode ? (
        <EditMode
          data={data}
          index={index}
          messageId={messageId}
          onCancel={() => {
            setIsEditMode(false);
          }}
        />
      ) : (
        <Image
          data={data}
          index={index}
          loading={loading}
          messageId={messageId}
          onEdit={() => {
            setIsEditMode(true);
          }}
        />
      )}
    </div>
  );
});

export default Item;
