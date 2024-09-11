import { DocRenderer } from '@cyntler/react-doc-viewer';
import { Center } from 'react-layout-kit';

const ImageRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const { uri, fileName } = currentDocument || {};

  return (
    <Center height={'100%'} width={'100%'}>
      <img
        alt={fileName}
        height={'100%'}
        src={uri}
        style={{ objectFit: 'contain', overflow: 'hidden' }}
        width={'100%'}
      />
    </Center>
  );
};

export default ImageRenderer;

ImageRenderer.fileTypes = [
  'jpg',
  'jpeg',
  'image/jpg',
  'image/jpeg',
  'png',
  'image/png',
  'webp',
  'image/webp',
  'gif',
  'image/gif',
  'bmp',
  'image/bmp',
];
ImageRenderer.weight = 0;
