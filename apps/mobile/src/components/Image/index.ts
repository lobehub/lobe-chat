import type { ForwardRefExoticComponent, RefAttributes } from 'react';

import InternalImage from './Image';
import PreviewGroup from './PreviewGroup';
import type { ImageProps } from './type';

export interface ImageComponentType
  extends ForwardRefExoticComponent<ImageProps & RefAttributes<any>> {
  PreviewGroup: typeof PreviewGroup;
}

const Image = InternalImage as unknown as ImageComponentType;
Image.PreviewGroup = PreviewGroup;

export default Image;
export type * from './type';
