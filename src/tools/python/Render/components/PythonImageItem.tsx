import { Icon, Image, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePlatform } from '@/hooks/usePlatform';
import { useChatStore } from '@/store/chat';
import { PythonImageItem } from '@/types/tool/python';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;

    aspect-ratio: auto;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    background: ${token.colorBgContainer};
  `,
  image: css`
    margin-block: 0 !important;
  `,
}));

interface PythonImageProps extends PythonImageItem {
  messageId: string;
}

const PythonImageItemComponent = memo<PythonImageProps>(({ imageId, previewUrl, filename }) => {
  const { t } = useTranslation('tool');
  const { styles } = useStyles();
  const { isSafari } = usePlatform();
  const [useFetchPythonImageItem] = useChatStore((s) => [s.useFetchPythonImageItem]);

  // 始终调用 Hook，当 imageId 为空时，SWR 将不会发起请求
  const { data, isLoading } = useFetchPythonImageItem(imageId || '');

  // 如果有永久 imageId，使用文件服务获取
  if (imageId) {
    return (
      <div className={styles.container}>
        <Image
          alt={filename}
          height={isSafari ? 'auto' : '100%'}
          isLoading={isLoading}
          size="100%"
          src={data?.url}
          style={{ height: isSafari ? 'auto' : '100%' }}
          wrapperClassName={styles.image}
        />
      </div>
    );
  }

  // 如果只有预览 URL，显示临时图片
  if (previewUrl) {
    return (
      <div className={styles.container}>
        <Flexbox style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}>
            <Tooltip title={t('python.uploading')}>
              <Icon icon={Loader2} size={'large'} spin />
            </Tooltip>
          </div>
          <Image alt={filename} size={'100%'} src={previewUrl} />
        </Flexbox>
      </div>
    );
  }

  return null;
});

export default PythonImageItemComponent;
