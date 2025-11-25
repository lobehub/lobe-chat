'use client';

import { Button, Dropdown, Icon, MenuProps } from '@lobehub/ui';
import { Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FilePenLine, FileUp, FolderIcon, FolderUp, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DragUpload from '@/components/DragUpload';
import { useFileStore } from '@/store/file';

import NoteEditorModal from '../DocumentExplorer/NoteEditorModal';

const hotArea = css`
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: transparent;
  }
`;

const AddButton = ({ knowledgeBaseId }: { knowledgeBaseId?: string }) => {
  const { t } = useTranslation('file');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pushDockFileList = useFileStore((s) => s.pushDockFileList);

  const handleOpenNoteEditor = () => {
    setIsModalOpen(true);
  };

  const handleCloseNoteEditor = () => {
    setIsModalOpen(false);
  };

  const handleCreateFolder = () => {
    setIsModalOpen(false);
  };

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={FilePenLine} />,
        key: 'create-note',
        label: t('header.actions.newPage'),
        onClick: handleOpenNoteEditor,
      },
      {
        icon: <Icon icon={FolderIcon} />,
        key: 'create-folder',
        label: t('header.actions.newFolder'),
        onClick: handleCreateFolder,
      },
      {
        type: 'divider',
      },
      {
        icon: <Icon icon={FileUp} />,
        key: 'upload-file',
        label: (
          <Upload
            beforeUpload={async (file) => {
              await pushDockFileList([file], knowledgeBaseId);

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
            beforeUpload={async (file) => {
              await pushDockFileList([file], knowledgeBaseId);

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
    [knowledgeBaseId, pushDockFileList],
  );

  return (
    <>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button icon={Plus} type="primary">
          {t('addKnowledge')}
        </Button>
      </Dropdown>
      <DragUpload
        enabledFiles
        onUploadFiles={(files) => pushDockFileList(files, knowledgeBaseId)}
      />
      <NoteEditorModal
        knowledgeBaseId={knowledgeBaseId}
        onClose={handleCloseNoteEditor}
        open={isModalOpen}
      />
    </>
  );
};

export default AddButton;
