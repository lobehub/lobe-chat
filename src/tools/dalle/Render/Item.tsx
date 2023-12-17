import { Icon } from '@lobehub/ui';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ImageFileItem from '@/components/FileList/ImageFileItem';
import { useChatStore } from '@/store/chat';
import { chatEnhanceSelectors } from '@/store/chat/selectors';
import { DallEImageItem } from '@/types/tool/dalle';

import EditMode from './EditMode';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  action: css`
    position: absolute;
    right: 4px;
    top: 4px;
    z-index: 100;
  `,
  container: css`
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;
    aspect-ratio: 1;
    overflow: scroll;

    .${prefixCls}-spin-nested-loading {
      height: 100%;
    }
  `,
}));

const ImageItem = memo<DallEImageItem & { messageId: string }>(
  ({ prompt, messageId, imageId, style, size, quality }) => {
    const { t } = useTranslation('tool');
    const { styles } = useStyles();

    const [edit, setEdit] = useState(false);
    const loading = useChatStore(chatEnhanceSelectors.isDallEImageGenerating(messageId + prompt));

    return !edit && imageId ? (
      <Flexbox style={{ position: 'relative' }}>
        {/*<Flexbox className={styles.action}>*/}
        {/*  <ActionIconGroup*/}
        {/*    items={[{ icon: LucideEdit, key: 'edit', label: t('edit', { ns: 'common' }) }]}*/}
        {/*    onActionClick={(e) => {*/}
        {/*      if (e.key === 'edit') {*/}
        {/*        setEdit(true);*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</Flexbox>*/}
        <ImageFileItem id={imageId} />
      </Flexbox>
    ) : (
      <Flexbox className={styles.container} padding={8}>
        {loading ? (
          <Spin indicator={<Icon icon={Loader2} spin />} size={'large'} tip={t('dalle.generating')}>
            {prompt}
          </Spin>
        ) : edit ? (
          <EditMode
            imageId={imageId}
            prompt={prompt}
            quality={quality}
            setEdit={setEdit}
            size={size}
            style={style}
          />
        ) : (
          prompt
        )}
      </Flexbox>
    );
  },
);

export default ImageItem;
