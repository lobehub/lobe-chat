import { Image } from 'antd';
import { PropsWithChildren, memo } from 'react';

const { PreviewGroup } = Image;

interface LightBoxProps extends PropsWithChildren {
  items: string[];
}

const LightBox = memo<LightBoxProps>(({ items, children }) => {
  if (items.length === 1) return children;

  return (
    <PreviewGroup
      preview={{
        styles: { mask: { backdropFilter: 'blur(2px)' } },
      }}
    >
      {children}
    </PreviewGroup>
  );
});

export default LightBox;
