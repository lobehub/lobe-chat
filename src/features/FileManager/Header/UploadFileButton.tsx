'use client';

import { Icon } from '@lobehub/ui';
import { Button, Dropdown, MenuProps, Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FileUp, FolderUp, PlusCircleIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import DragUpload from '@/components/DragUpload';
import { useFileStore } from '@/store/file';

const hotArea = css`
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: transparent;
  }
`;

const UploadFileButton = ({ knowledgeBaseId }: { knowledgeBaseId?: string }) => {
  const { t } = useTranslation('file');

  const pushDockFileList = useFileStore((s) => s.pushDockFileList);
  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={FileUp} />,
        key: 'upload-file',
        label: (
          <Upload
            beforeUpload={async (_, fileList) => {
              await pushDockFileList(Array.from(fileList), knowledgeBaseId);

              return false;
            }}
            multiple={true}
            showUploadList={false}
          >
            <div className={cx(hotArea)}>{t('header.actions.uploadFile')}</div>
          </Upload>
        ),
      },
      {
        icon: <Icon icon={FolderUp} />,
        key: 'upload-folder',
        label: (
          <Upload
            beforeUpload={async (_, fileList) => {
              await pushDockFileList(Array.from(fileList), knowledgeBaseId);

              return false;
            }}
            directory
            multiple={true}
            showUploadList={false}
          >
            <div className={cx(hotArea)}>{t('header.actions.uploadFolder')}</div>
          </Upload>
        ),
      },
    ],
    [],
  );
  return (
    <>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button icon={<Icon icon={PlusCircleIcon} />}>{t('header.uploadButton')}</Button>
      </Dropdown>
      <DragUpload
        enabledFiles
        onUploadFiles={(files) => pushDockFileList(files, knowledgeBaseId)}
      />
    </>
  );
};

export default UploadFileButton;
