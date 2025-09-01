import { ImageReference, Image as MdImage } from 'mdast';
import { ReactNode, useEffect, useState } from 'react';
import { Image } from 'react-native';

import { useMarkdownContext } from '../context';
import { RendererArgs } from './renderers';
import Skeleton from '../../Skeleton';

type AutoSizedImageProps = {
  uri: string;
};

export const FALLBACK =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2NDAgNDAwIj48cGF0aCBmaWxsPSIjM0IzQjNCIiBkPSJNMCAwaDY0MHY0MDBIMHoiLz48cGF0aCBzdHJva2U9IiM2MjYyNjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxNSIgZD0iTTM3Mi41IDEzMi41aC0xMDVjLTguMjg0IDAtMTUgNi43MTYtMTUgMTV2MTA1YzAgOC4yODQgNi43MTYgMTUgMTUgMTVoMTA1YzguMjg0IDAgMTUtNi43MTYgMTUtMTV2LTEwNWMwLTguMjg0LTYuNzE2LTE1LTE1LTE1eiIvPjxwYXRoIHN0cm9rZT0iIzYyNjI2MiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjE1IiBkPSJNMjk3LjUgMTkyLjVjOC4yODQgMCAxNS02LjcxNiAxNS0xNSAwLTguMjg0LTYuNzE2LTE1LTE1LTE1LTguMjg0IDAtMTUgNi43MTYtMTUgMTUgMCA4LjI4NCA2LjcxNiAxNSAxNSAxNXpNMzg3LjUgMjIyLjUwMmwtMjMuMTQ1LTIzLjE0NWExNS4wMDEgMTUuMDAxIDAgMDAtMjEuMjEgMEwyNzUgMjY3LjUwMiIvPjwvc3ZnPg==';

const AutoSizedImage = ({ uri }: AutoSizedImageProps) => {
  const { contentSize, styles } = useMarkdownContext();
  const [error, setError] = useState(false);
  const [size, setSize] = useState<{ height: number; width: number }>({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    Image.getSize(uri, (width, height) => {
      const ratio = height / width;
      const newWidth = Math.min(width, contentSize.width);
      const newHeight = newWidth * ratio;
      setSize({ height: newHeight, width: newWidth });
    });
  }, [contentSize, uri]);

  if (size.width === 0 || size.height === 0) {
    return <Skeleton.Image animated key={uri} />;
  }

  return (
    <Image
      key={uri}
      onError={() => {
        setError(true);
      }}
      source={error ? { uri: FALLBACK } : { uri }}
      style={[styles.image, { height: size.height, width: size.width }]}
    />
  );
};

export const ImageReferenceRenderer = ({ node }: RendererArgs<ImageReference>): ReactNode => {
  const { definitions } = useMarkdownContext();

  const imageDefinition = definitions[node.identifier];
  if (!imageDefinition || !imageDefinition.url) {
    return null;
  }

  return <AutoSizedImage uri={imageDefinition.url} />;
};

export const ImageRenderer = ({ node }: RendererArgs<MdImage>): ReactNode => {
  if (!node.url) {
    return null;
  }

  return <AutoSizedImage uri={node.url} />;
};
