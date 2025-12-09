'use client';

import { Image } from '@lobehub/ui/mdx';
import { ComponentProps, FC } from 'react';

type ImageWrapperProps = ComponentProps<typeof Image>;

const ImageWrapper: FC<ImageWrapperProps> = ({ alt, src, ...rest }) => (
  <Image alt={alt} src={src} {...rest} />
);

export default ImageWrapper;
