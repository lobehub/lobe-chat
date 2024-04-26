import { Icon, Image, Tooltip } from '@lobehub/ui';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ImageFileItem from '@/components/FileList/ImageFileItem';
import { useChatStore } from '@/store/chat';
import { chatToolSelectors } from '@/store/chat/selectors';
import { DallEImageItem } from '@/types/tool/dalle';

import EditMode from './EditMode';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  action: css`
    position: absolute;
    z-index: 100;
    top: 4px;
    right: 4px;
  `,
  container: css`
    overflow: scroll;
    aspect-ratio: 1;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    .${prefixCls}-spin-nested-loading {
      height: 100%;
    }
  `,
}));

const ImageItem = memo<DallEImageItem & { messageId: string }>(
  ({ prompt, messageId, imageId, previewUrl, style, size, quality }) => {
    const { t } = useTranslation('tool');
    const { styles } = useStyles();

    const [edit, setEdit] = useState(false);
    const loading = useChatStore(chatToolSelectors.isDallEImageGenerating(messageId + prompt));

    if (edit)
      return (
        <Flexbox className={styles.container} padding={8}>
          <EditMode
            imageId={imageId}
            prompt={prompt}
            quality={quality}
            setEdit={setEdit}
            size={size}
            style={style}
          />
        </Flexbox>
      );

    if (imageId || previewUrl)
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

    return (
      <Flexbox className={styles.container} padding={8}>
        {loading ? (
          <Spin indicator={<Icon icon={Loader2} spin />} size={'large'} tip={t('dalle.generating')}>
            {prompt}
          </Spin>
        ) : (
          prompt
        )}
      </Flexbox>
    );
  },
);

export default ImageItem;
