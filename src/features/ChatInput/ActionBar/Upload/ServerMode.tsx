import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Dropdown, MenuProps, Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FileUp, FolderUp, ImageUp, Paperclip } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

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

  const canUploadImage = useUserStore(modelProviderSelectors.isModelEnabledVision(model));

  const items: MenuProps['items'] = [
    {
      disabled: !canUploadImage,
      icon: <Icon icon={ImageUp} style={{ fontSize: '16px' }} />,
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
      icon: <Icon icon={FileUp} style={{ fontSize: '16px' }} />,
      key: 'upload-file',
      label: (
        <Upload
          beforeUpload={async (file) => {
            if (!canUploadImage && file.type.startsWith('image')) return false;

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
      icon: <Icon icon={FolderUp} style={{ fontSize: '16px' }} />,
      key: 'upload-folder',
      label: (
        <Upload
          beforeUpload={async (file) => {
            if (!canUploadImage && file.type.startsWith('image')) return false;

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
    <Dropdown menu={{ items }} placement="top">
      <ActionIcon icon={Paperclip} placement={'bottom'} title={t('upload.action.tooltip')} />
    </Dropdown>
  );
});

export default FileUpload;
