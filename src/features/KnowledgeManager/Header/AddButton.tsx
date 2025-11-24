'use client';

import { Button, Dropdown, Icon, MenuProps } from '@lobehub/ui';
import { Input, Modal, Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FilePenLine, FileUp, FolderIcon, FolderUp, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useFolderPath } from '@/app/[variants]/(main)/knowledge/hooks/useFolderPath';
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
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const pushDockFileList = useFileStore((s) => s.pushDockFileList);
  const createFolder = useFileStore((s) => s.createFolder);
  const { currentFolderSlug } = useFolderPath();
  const parentId = currentFolderSlug;

  const handleOpenNoteEditor = () => {
    setIsModalOpen(true);
  };

  const handleCloseNoteEditor = () => {
    setIsModalOpen(false);
  };

  const handleCreateFolder = () => {
    setIsFolderModalOpen(true);
  };

  const handleConfirmCreateFolder = async () => {
    if (!folderName) return;
    await createFolder(folderName, parentId || undefined, knowledgeBaseId);
    setIsFolderModalOpen(false);
    setFolderName('');
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
              await pushDockFileList([file], knowledgeBaseId, parentId || undefined);

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
              await pushDockFileList([file], knowledgeBaseId, parentId || undefined);

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
    [knowledgeBaseId, parentId, pushDockFileList],
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
        onUploadFiles={(files) => pushDockFileList(files, knowledgeBaseId, parentId || undefined)}
      />
      <NoteEditorModal
        knowledgeBaseId={knowledgeBaseId}
        onClose={handleCloseNoteEditor}
        open={isModalOpen}
        parentId={parentId || undefined}
      />
      <Modal
        onCancel={() => setIsFolderModalOpen(false)}
        onOk={handleConfirmCreateFolder}
        open={isFolderModalOpen}
        title={t('header.actions.newFolder')}
      >
        <Input
          autoFocus
          onChange={(e) => setFolderName(e.target.value)}
          onPressEnter={handleConfirmCreateFolder}
          placeholder={t('header.actions.folderNamePlaceholder', 'Folder Name')}
          value={folderName}
        />
      </Modal>
    </>
  );
};

export default AddButton;
