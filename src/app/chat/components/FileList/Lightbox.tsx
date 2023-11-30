import { Image } from 'antd';
import { PropsWithChildren, memo } from 'react';

import { filesSelectors, useFileStore } from '@/store/file';

const { PreviewGroup } = Image;

interface LightBoxProps extends PropsWithChildren {
  items: string[];
}

const LightBox = memo<LightBoxProps>(({ items, children }) => {
  const list = useFileStore(filesSelectors.getImageUrlByList(items));

  if (list.length === 1) return children;

  return (
    <PreviewGroup
      items={list}
      preview={{
        styles: { mask: { backdropFilter: 'blur(2px)' } },
      }}
    >
      {children}
    </PreviewGroup>
  );
});

export default LightBox;
