import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionIcon, Icon } from '@lobehub/ui';
import { Download } from 'lucide-react';

import { useChatStore } from '@/store/chat';
import { DallEImageItem } from '@/types/tool/dalle';
import { downloadFile } from '@/utils/downloadFile';

export interface ToolBarProps {
  data: DallEImageItem[];
  messageId: string;
}

const ToolBar = memo<ToolBarProps>(({ data, messageId }) => {
  const { t } = useTranslation('common');
  const useFetchDalleImageItem = useChatStore((s) => s.useFetchDalleImageItem);

  const handleDownloadAll = async () => {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item.imageId) continue;

      const { data: imageData } = useFetchDalleImageItem(item.imageId);
      if (!imageData?.url) continue;

      await downloadFile(imageData.url, `pollinations-${i}.png`);
    }
  };

  return (
    <div className="flex justify-end">
      <ActionIcon
        icon={<Icon icon={Download} />}
        onClick={handleDownloadAll}
        size="small"
        title={t('downloadAll')}
      />
    </div>
  );
});

export default ToolBar;
