'use client';

import { Button, Dropdown, Icon, MenuProps } from '@lobehub/ui';
import { Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FilePenLine, FileUp, FolderIcon, FolderUp, Link, Plus } from 'lucide-react';
import { type ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DragUpload from '@/components/DragUpload';
import PageEditorModal from '@/features/PageEditor/Modal';
import { useFileStore } from '@/store/file';

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
  const uploadFolderWithStructure = useFileStore((s) => s.uploadFolderWithStructure);
  const createFolder = useFileStore((s) => s.createFolder);
  const setPendingRenameItemId = useFileStore((s) => s.setPendingRenameItemId);
  const currentFolderId = useFileStore((s) => s.currentFolderId);

  const handleOpenNoteEditor = () => {
    setIsModalOpen(true);
  };

  const handleCloseNoteEditor = () => {
    setIsModalOpen(false);
  };

  const handleCreateFolder = async () => {
    // Create folder with "Untitled" name immediately
    const folderId = await createFolder('Untitled', currentFolderId ?? undefined, knowledgeBaseId);
    // Trigger auto-rename
    setPendingRenameItemId(folderId);
  };

  const handleFolderUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    await uploadFolderWithStructure(files, knowledgeBaseId, currentFolderId ?? undefined);
    // Reset input to allow re-uploading the same folder
    event.target.value = '';
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
              await pushDockFileList([file], knowledgeBaseId, currentFolderId ?? undefined);

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
          <label className={cx(hotArea)} htmlFor="folder-upload-input">
            {t('header.actions.uploadFolder')}
          </label>
        ),
      },
      {
        type: 'divider',
      },
      {
        children: [
          {
            key: 'connect-notion',
            label: 'Notion',
            onClick: () => {
              // TODO: Implement Notion connection
            },
          },
          {
            key: 'connect-google-drive',
            label: 'Google Drive',
            onClick: () => {
              // TODO: Implement Google Drive connection
            },
          },
          {
            key: 'connect-onedrive',
            label: 'OneDrive',
            onClick: () => {
              // TODO: Implement OneDrive connection
            },
          },
        ],
        icon: <Icon icon={Link} />,
        key: 'connect',
        label: t('header.actions.connect'),
      },
    ],
    [knowledgeBaseId, currentFolderId, pushDockFileList],
  );

  return (
    <>
      <Dropdown menu={{ items }} placement="bottomRight">
        <Button icon={Plus} type="primary">
          {t('addLibrary')}
        </Button>
      </Dropdown>
      <DragUpload
        enabledFiles
        onUploadFiles={(files) =>
          pushDockFileList(files, knowledgeBaseId, currentFolderId ?? undefined)
        }
      />
      <input
        id="folder-upload-input"
        multiple
        onChange={handleFolderUpload}
        style={{ display: 'none' }}
        type="file"
        // @ts-expect-error - webkitdirectory is not in the React types
        webkitdirectory=""
      />
      <PageEditorModal
        knowledgeBaseId={knowledgeBaseId}
        onClose={handleCloseNoteEditor}
        open={isModalOpen}
        parentId={currentFolderId ?? undefined}
      />
    </>
  );
};

export default AddButton;
