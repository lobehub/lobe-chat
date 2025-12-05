'use client';

import { Button, Dropdown, Icon, MenuProps } from '@lobehub/ui';
import { Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FilePenLine, FileUp, FolderIcon, FolderUp, Link, Plus } from 'lucide-react';
import { type ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import DragUpload from '@/components/DragUpload';
import PageEditorModal from '@/features/PageEditor/Modal';
import { useFileStore } from '@/store/file';
import { DocumentSourceType } from '@/types/document';
import { filterFilesByGitignore, findGitignoreFile, readGitignoreContent } from '@/utils/gitignore';

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
  const createDocument = useFileStore((s) => s.createDocument);
  const setPendingRenameItemId = useFileStore((s) => s.setPendingRenameItemId);
  const currentFolderId = useFileStore((s) => s.currentFolderId);
  const setMode = useResourceManagerStore((s) => s.setMode);
  const setCurrentViewItemId = useResourceManagerStore((s) => s.setCurrentViewItemId);

  const handleOpenNoteEditor = async () => {
    // Create a new page directly and switch to page view
    const untitledTitle = t('documentList.untitled');
    const newPage = await createDocument({
      content: '',
      knowledgeBaseId,
      parentId: currentFolderId ?? undefined,
      title: untitledTitle,
    });

    // Add to local document map for immediate availability
    const newDocumentMap = new Map(useFileStore.getState().localDocumentMap);
    newDocumentMap.set(newPage.id, {
      content: newPage.content || '',
      createdAt: newPage.createdAt ? new Date(newPage.createdAt) : new Date(),
      editorData:
        typeof newPage.editorData === 'string'
          ? JSON.parse(newPage.editorData)
          : newPage.editorData || null,
      fileType: 'custom/document',
      filename: newPage.title || untitledTitle,
      id: newPage.id,
      metadata: newPage.metadata || {},
      source: 'document',
      sourceType: DocumentSourceType.EDITOR,
      title: newPage.title || untitledTitle,
      totalCharCount: newPage.content?.length || 0,
      totalLineCount: 0,
      updatedAt: newPage.updatedAt ? new Date(newPage.updatedAt) : new Date(),
    });
    useFileStore.setState({ localDocumentMap: newDocumentMap });

    // Switch to page view mode
    setCurrentViewItemId(newPage.id);
    setMode('page');
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
    let files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check for .gitignore file
    const gitignoreFile = findGitignoreFile(files);

    if (gitignoreFile) {
      try {
        const gitignoreContent = await readGitignoreContent(gitignoreFile);
        const originalCount = files.length;

        // Show confirmation modal using antd's Modal.confirm
        const { Modal } = await import('antd');

        Modal.confirm({
          cancelText: t('header.actions.gitignore.cancel'),
          content: t('header.actions.gitignore.content', {
            count: originalCount,
          }),
          okText: t('header.actions.gitignore.apply'),
          onCancel: async () => {
            // Upload all files without filtering
            await uploadFolderWithStructure(files, knowledgeBaseId, currentFolderId ?? undefined);
          },
          onOk: async () => {
            // Filter files based on .gitignore
            const filteredFiles = filterFilesByGitignore(files, gitignoreContent);
            const ignoredCount = originalCount - filteredFiles.length;

            if (ignoredCount > 0) {
              const { message } = await import('antd');
              message.info(
                t('header.actions.gitignore.filtered', {
                  ignored: ignoredCount,
                  total: originalCount,
                }),
              );
            }

            await uploadFolderWithStructure(
              filteredFiles,
              knowledgeBaseId,
              currentFolderId ?? undefined,
            );
          },
          title: t('header.actions.gitignore.title'),
        });
      } catch (error) {
        console.error('Failed to read .gitignore:', error);
        // If reading fails, proceed without filtering
        await uploadFolderWithStructure(files, knowledgeBaseId, currentFolderId ?? undefined);
      }
    } else {
      // No .gitignore found, upload all files
      await uploadFolderWithStructure(files, knowledgeBaseId, currentFolderId ?? undefined);
    }

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
      ...(knowledgeBaseId
        ? [
            {
              icon: <Icon icon={FolderIcon} />,
              key: 'create-folder',
              label: t('header.actions.newFolder'),
              onClick: handleCreateFolder,
            },
          ]
        : []),
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
        <Button
          icon={Plus}
          size={'small'}
          style={{ borderRadius: 8, fontSize: 13, height: 32, paddingRight: 12 }}
          type="primary"
        >
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
