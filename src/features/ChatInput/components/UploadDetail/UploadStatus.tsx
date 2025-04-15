import { CheckCircleFilled } from '@ant-design/icons';
import { Icon } from '@lobehub/ui';
import { Progress, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { Loader2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FileUploadState, FileUploadStatus } from '@/types/files/upload';
import { formatSize } from '@/utils/format';

interface UploadStateProps {
  size: number;
  status: FileUploadStatus;
  uploadState?: FileUploadState;
}

const UploadStatus = memo<UploadStateProps>(({ status, size, uploadState }) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');

  switch (status) {
    default:
    case 'pending': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <Icon icon={Loader2Icon} size={12} spin />
          <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('upload.preview.status.pending')}
          </Typography.Text>
        </Flexbox>
      );
    }

    case 'uploading': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <Progress percent={uploadState?.progress} size={14} type="circle" />
          <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
            {formatSize(size * ((uploadState?.progress || 0) / 100), 2)} / {formatSize(size)}
          </Typography.Text>
        </Flexbox>
      );
    }

    case 'processing': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <Progress percent={uploadState?.progress} size={14} type="circle" />
          <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
            {formatSize(size)} · {t('upload.preview.status.processing')}
          </Typography.Text>
        </Flexbox>
      );
    }

    case 'success': {
      return (
        <Flexbox align={'center'} gap={4} horizontal>
          <CheckCircleFilled style={{ color: theme.colorSuccess, fontSize: 12 }} />
          <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
            {formatSize(size)}
          </Typography.Text>
        </Flexbox>
      );
    }
  }
});

export default UploadStatus;
