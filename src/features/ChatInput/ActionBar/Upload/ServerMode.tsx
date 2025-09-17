import { validateVideoFileSize } from '@lobechat/utils/client';
import { MenuProps, Tooltip } from '@lobehub/ui';
import { Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FileUp, FolderUp, ImageUp, Paperclip } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { message } from '@/components/AntdStaticMethods';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useFileStore } from '@/store/file';

import Action from '../components/Action';

const hotArea = css`
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: transparent;
  }
`;

const FileUpload = memo(() => {
  const { t } = useTranslation('chat');

  const upload = useFileStore((s) => s.uploadChatFiles);

  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);

  const canUploadImage = useModelSupportVision(model, provider);

  const items: MenuProps['items'] = [
    {
      disabled: !canUploadImage,
      icon: ImageUp,
      key: 'upload-image',
      label: canUploadImage ? (
        <Upload
          accept={'image/*'}
          beforeUpload={async (file) => {
            await upload([file]);

            return false;
          }}
          multiple
          showUploadList={false}
        >
          <div className={cx(hotArea)}>{t('upload.action.imageUpload')}</div>
        </Upload>
      ) : (
        <Tooltip placement={'right'} title={t('upload.action.imageDisabled')}>
          <div className={cx(hotArea)}>{t('upload.action.imageUpload')}</div>
        </Tooltip>
      ),
    },
    {
      icon: FileUp,
      key: 'upload-file',
      label: (
        <Upload
          beforeUpload={async (file) => {
            if (!canUploadImage && (file.type.startsWith('image') || file.type.startsWith('video')))
              return false;

            // Validate video file size
            const validation = validateVideoFileSize(file);
            if (!validation.isValid) {
              message.error(
                t('upload.validation.videoSizeExceeded', {
                  actualSize: validation.actualSize,
                }),
              );
              return false;
            }

            await upload([file]);

            return false;
          }}
          multiple
          showUploadList={false}
        >
          <div className={cx(hotArea)}>{t('upload.action.fileUpload')}</div>
        </Upload>
      ),
    },
    {
      icon: FolderUp,
      key: 'upload-folder',
      label: (
        <Upload
          beforeUpload={async (file) => {
            if (!canUploadImage && (file.type.startsWith('image') || file.type.startsWith('video')))
              return false;

            // Validate video file size
            const validation = validateVideoFileSize(file);
            if (!validation.isValid) {
              message.error(
                t('upload.validation.videoSizeExceeded', {
                  actualSize: validation.actualSize,
                }),
              );
              return false;
            }

            await upload([file]);

            return false;
          }}
          directory
          multiple={true}
          showUploadList={false}
        >
          <div className={cx(hotArea)}>{t('upload.action.folderUpload')}</div>
        </Upload>
      ),
    },
  ];

  return (
    <Action
      dropdown={{
        menu: { items },
      }}
      icon={Paperclip}
      showTooltip={false}
      title={t('upload.action.tooltip')}
    />
  );
});

export default FileUpload;
