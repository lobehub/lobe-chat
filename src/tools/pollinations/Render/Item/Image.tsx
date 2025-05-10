import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionIcon, Avatar, Highlighter, Icon } from '@lobehub/ui';
import { Dropdown, Skeleton, Typography } from 'antd';
import { Download, Edit, MoreHorizontal, Share2 } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useChatStore } from '@/store/chat';
import { DallEImageItem } from '@/types/tool/dalle';
import { downloadFile } from '@/utils/downloadFile';

export interface ImageProps {
  data: DallEImageItem;
  index: number;
  loading?: boolean;
  messageId: string;
  onEdit: () => void;
}

const Image = memo<ImageProps>(({ data, index, loading, messageId, onEdit }) => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const useFetchDalleImageItem = useChatStore((s) => s.useFetchDalleImageItem);

  const { data: imageData } = useFetchDalleImageItem(data.imageId || '');

  const handleDownload = () => {
    if (!imageData?.url) return;

    downloadFile(imageData.url, `pollinations-${index}.png`);
  };

  const handleShare = async () => {
    if (!imageData?.url) return;

    try {
      await navigator.share({
        files: [
          await fetch(imageData.url)
            .then((res) => res.blob())
            .then((blob) => new File([blob], `pollinations-${index}.png`, { type: 'image/png' })),
        ],
        title: 'Share Image',
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const items = [
    {
      icon: <Icon icon={Edit} />,
      key: 'edit',
      label: t('edit'),
      onClick: onEdit,
    },
    {
      icon: <Icon icon={Download} />,
      key: 'download',
      label: t('download'),
      onClick: handleDownload,
    },
    {
      icon: <Icon icon={Share2} />,
      key: 'share',
      label: t('share'),
      onClick: handleShare,
    },
  ];

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-lg">
      {loading ? (
        <Skeleton active className="h-full w-full" />
      ) : (
        <>
          {data.previewUrl || imageData?.url ? (
            <img
              alt={data.prompt}
              className="h-full w-full object-cover"
              src={data.previewUrl || imageData?.url}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/5">
              <Avatar avatar="🖼️" background={theme === 'dark' ? '#000' : '#fff'} size={64} />
            </div>
          )}
          <div className="absolute inset-x-0 top-0 flex justify-end p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
              <ActionIcon icon={MoreHorizontal} size="small" />
            </Dropdown>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Typography.Paragraph
              ellipsis={{ rows: 2 }}
              style={{ color: 'white', margin: 0, textShadow: '0 0 4px rgba(0, 0, 0, 0.8)' }}
            >
              <Highlighter highlightStyle={{ color: 'white' }} keyword={data.prompt} text={data.prompt} />
            </Typography.Paragraph>
          </div>
        </>
      )}
    </div>
  );
});

export default Image;
