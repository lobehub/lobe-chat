import { Icon, Tooltip } from '@lobehub/ui';
import { Button } from 'antd';
import { FileBoxIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useFileStore } from '@/store/file';
import { isChunkingUnsupported } from '@/utils/isChunkingUnsupported';

interface BatchChunkingButtonProps {
  onClick: () => void;
  selectFileIds: string[];
}

export const BatchChunkingButton = memo<BatchChunkingButtonProps>(({ onClick, selectFileIds }) => {
  const { t } = useTranslation('components');
  const [fileList] = useFileStore((s) => [s.fileList]);

  const unsupportedFileTypes = useMemo(() => {
    const types: string[] = [];
    for (const id of selectFileIds) {
      const file = fileList.find((item) => item.id === id);
      if (!file) continue;
      if (isChunkingUnsupported(file.fileType)) types.push(file.fileType);
    }
    return types.length > 0 ? types.join(', ') : undefined;
  }, [selectFileIds, fileList]);

  if (!unsupportedFileTypes)
    return (
      <Button icon={<Icon icon={FileBoxIcon} />} onClick={onClick} size={'small'}>
        {t('FileManager.actions.batchChunking')}
      </Button>
    );

  return (
    <Tooltip
      title={t('FileManager.actions.batchChunkingUnsupported', { types: unsupportedFileTypes })}
    >
      <Button disabled icon={<Icon icon={FileBoxIcon} />} onClick={onClick} size={'small'}>
        {t('FileManager.actions.batchChunking')}
      </Button>
    </Tooltip>
  );
});

export default BatchChunkingButton;
