import { ImageGallery } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import GalleyGrid from '@/components/GalleyGrid';
import { BuiltinRenderProps } from '@/types/tool';
import { DallEImageItem } from '@/types/tool/dalle';

import ImageItem from './Item';

const DallE = memo<BuiltinRenderProps<DallEImageItem[]>>(({ content, messageId }) => (
  <Flexbox gap={16}>
    {/* 没想好工具条的作用 */}
    {/*<ToolBar content={content} messageId={messageId} />*/}
    <ImageGallery>
      <GalleyGrid items={content.map((c) => ({ ...c, messageId }))} renderItem={ImageItem} />
    </ImageGallery>
  </Flexbox>
));

export default DallE;
