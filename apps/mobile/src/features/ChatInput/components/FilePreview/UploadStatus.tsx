import { FileUploadState, FileUploadStatus } from '@lobechat/types';
import { Center, Flexbox, Icon, Text } from '@lobehub/ui-rn';
import { CheckIcon, Loader2 } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/components/styles';
import { formatSize } from '@/utils/format';

import CircularProgress from './CircularProgress';

interface UploadStatusProps {
  size: number;
  status: FileUploadStatus;
  uploadState?: FileUploadState;
}

/**
 * UploadStatus - Display file upload status with size
 * Aligned with web's UploadStatus component
 */
const UploadStatus = memo<UploadStatusProps>(({ status, size, uploadState }) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');

  switch (status) {
    default:
    case 'pending': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <Icon color={theme.colorTextSecondary} icon={Loader2} size={12} spin />
          <Text fontSize={12} type={'secondary'}>
            {t('upload.status.pending')}
          </Text>
        </Flexbox>
      );
    }

    case 'uploading': {
      const progress = uploadState?.progress || 0;
      const uploadedSize = size * (progress / 100);
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <CircularProgress percent={progress} size={14} />
          <Text fontSize={12} type={'secondary'}>
            {formatSize(uploadedSize, 0)}
          </Text>
        </Flexbox>
      );
    }

    case 'processing': {
      const progress = uploadState?.progress || 0;
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <CircularProgress percent={progress} size={14} />
          <Text fontSize={12} type={'secondary'}>
            {formatSize(size)}
          </Text>
        </Flexbox>
      );
    }

    case 'success': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <Center
            height={14}
            style={{
              backgroundColor: theme.colorSuccess,
              borderRadius: 14,
            }}
            width={14}
          >
            <CheckIcon color={theme.colorBgContainer} size={8} strokeWidth={4} />
          </Center>

          <Text fontSize={12} type={'secondary'}>
            {formatSize(size)}
          </Text>
        </Flexbox>
      );
    }

    case 'error': {
      return (
        <Text fontSize={12} type={'danger'}>
          {t('upload.status.error')}
        </Text>
      );
    }
  }
});

UploadStatus.displayName = 'UploadStatus';

export default UploadStatus;
