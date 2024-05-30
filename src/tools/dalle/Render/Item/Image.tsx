import { Icon, Image, Tooltip } from '@lobehub/ui';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ImageFileItem from './ImageFileItem';

interface ImagePreviewProps {
  imageId?: string;
  previewUrl?: string;
  prompt: string;
}

const ImagePreview = memo<ImagePreviewProps>(({ imageId, previewUrl, prompt }) => {
  const { t } = useTranslation('tool');

  return imageId ? (
    // <Flexbox className={styles.action}>
    //   <ActionIconGroup
    //     items={[{ icon: LucideEdit, key: 'edit', label: t('edit', { ns: 'common' }) }]}
    //     onActionClick={(e) => {
    //       if (e.key === 'edit') {
    //         setEdit(true);
    //       }
    //     }}
    //   />
    // </Flexbox>
    <ImageFileItem id={imageId} />
  ) : (
    previewUrl && (
      <Flexbox style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
          <Tooltip title={t('dalle.downloading')}>
            <Icon icon={Loader2} size={'large'} spin />
          </Tooltip>
        </div>
        <Image alt={prompt} size={'100%'} src={previewUrl} />
      </Flexbox>
    )
  );
});

export default ImagePreview;
