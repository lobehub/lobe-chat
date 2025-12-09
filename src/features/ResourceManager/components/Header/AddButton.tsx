'use client';

import { Notion } from '@lobehub/icons';
import { Button, Dropdown, Icon, MenuProps } from '@lobehub/ui';
import { Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FilePenLine, FileUp, FolderIcon, FolderUp, Link, Plus } from 'lucide-react';
import { type ChangeEvent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import DragUpload from '@/components/DragUpload';
import GuideModal from '@/components/GuideModal';
import GuideVideo from '@/components/GuideVideo';
import { useFileStore } from '@/store/file';
import { DocumentSourceType } from '@/types/document';
import { filterFilesByGitignore, findGitignoreFile, readGitignoreContent } from '@/utils/gitignore';

import useNotionImport from './hooks/useNotionImport';

const hotArea = css`
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: transparent;
  }
`;

const NOTION_GUIDE_VIDEO_SRC = 'https://hub-apac-1.lobeobjects.space/assets/notion.mp4';

const AddButton = () => {
  const { t } = useTranslation('file');
  const pushDockFileList = useFileStore((s) => s.pushDockFileList);
  const uploadFolderWithStructure = useFileStore((s) => s.uploadFolderWithStructure);
  const createFolder = useFileStore((s) => s.createFolder);
  const createDocument = useFileStore((s) => s.createDocument);
  const setPendingRenameItemId = useFileStore((s) => s.setPendingRenameItemId);
  const currentFolderId = useFileStore((s) => s.currentFolderId);

  const [libraryId, setCurrentViewItemId, setMode] = useResourceManagerStore((s) => [
    s.libraryId,
    s.setCurrentViewItemId,
    s.setMode,
  ]);

  const handleOpenNoteEditor = useCallback(async () => {
    // Create a new page directly and switch to page view
    const untitledTitle = t('documentList.untitled');
    const newPage = await createDocument({
      content: '',
      knowledgeBaseId: libraryId,
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
  }, [createDocument, currentFolderId, libraryId, setCurrentViewItemId, setMode, t]);

  const handleCreateFolder = useCallback(async () => {
    // Create folder with "Untitled" name immediately
    const folderId = await createFolder('Untitled', currentFolderId ?? undefined, libraryId);
    // Trigger auto-rename
    setPendingRenameItemId(folderId);
  }, [createFolder, currentFolderId, libraryId, setPendingRenameItemId]);

  const handleFolderUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
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
              await uploadFolderWithStructure(files, libraryId, currentFolderId ?? undefined);
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
                libraryId,
                currentFolderId ?? undefined,
              );
            },
            title: t('header.actions.gitignore.title'),
          });
        } catch (error) {
          console.error('Failed to read .gitignore:', error);
          // If reading fails, proceed without filtering
          await uploadFolderWithStructure(files, libraryId, currentFolderId ?? undefined);
        }
      } else {
        // No .gitignore found, upload all files
        await uploadFolderWithStructure(files, libraryId, currentFolderId ?? undefined);
      }

      // Reset input to allow re-uploading the same folder
      event.target.value = '';
    },
    [currentFolderId, libraryId, t, uploadFolderWithStructure],
  );

  const {
    handleCloseNotionGuide,
    handleNotionImport,
    handleOpenNotionGuide,
    handleStartNotionImport,
    notionGuideOpen,
    notionInputRef,
  } = useNotionImport({
    createDocument,
    currentFolderId,
    libraryId,
    t,
  });

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={FilePenLine} />,
        key: 'create-note',
        label: t('header.actions.newPage'),
        onClick: handleOpenNoteEditor,
      },
      ...(libraryId
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
              await pushDockFileList([file], libraryId, currentFolderId ?? undefined);

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
            icon: <Notion />,
            key: 'connect-notion',
            label: 'Notion',
            onClick: handleOpenNotionGuide,
          },
          {
            icon: <Icon icon={Notion} />,
            key: 'connect-google-drive',
            label: 'Google Drive',
            onClick: () => {
              // TODO: Implement Google Drive connection
            },
          },
          {
            icon: <Icon icon={Notion} />,
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
    [
      currentFolderId,
      handleCreateFolder,
      handleOpenNoteEditor,
      handleOpenNotionGuide,
      libraryId,
      pushDockFileList,
      t,
    ],
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
      <GuideModal
        cancelText={t('header.actions.notionGuide.cancel')}
        cover={<GuideVideo height={269} src={NOTION_GUIDE_VIDEO_SRC} width={358} />}
        desc={t('header.actions.notionGuide.desc')}
        okText={t('header.actions.notionGuide.ok')}
        onCancel={handleCloseNotionGuide}
        onOk={handleStartNotionImport}
        open={notionGuideOpen}
        title={t('header.actions.notionGuide.title')}
      />
      <DragUpload
        enabledFiles
        onUploadFiles={(files) => pushDockFileList(files, libraryId, currentFolderId ?? undefined)}
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
      <input
        accept=".zip"
        onChange={handleNotionImport}
        ref={notionInputRef}
        style={{ display: 'none' }}
        type="file"
      />
    </>
  );
};

export default AddButton;
