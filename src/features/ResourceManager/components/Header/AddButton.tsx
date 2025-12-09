'use client';

import { Notion } from '@lobehub/icons';
import { Button, Dropdown, Icon, MenuProps } from '@lobehub/ui';
import { Upload } from 'antd';
import { css, cx } from 'antd-style';
import { FilePenLine, FileUp, FolderIcon, FolderUp, Link, Plus } from 'lucide-react';
import { type ChangeEvent, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import DragUpload from '@/components/DragUpload';
import { useFileStore } from '@/store/file';
import { DocumentSourceType } from '@/types/document';
import { filterFilesByGitignore, findGitignoreFile, readGitignoreContent } from '@/utils/gitignore';
import { unzipFile } from '@/utils/unzipFile';

const hotArea = css`
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: transparent;
  }
`;

const AddButton = () => {
  const { t } = useTranslation('file');
  const pushDockFileList = useFileStore((s) => s.pushDockFileList);
  const uploadFolderWithStructure = useFileStore((s) => s.uploadFolderWithStructure);
  const createFolder = useFileStore((s) => s.createFolder);
  const createDocument = useFileStore((s) => s.createDocument);
  const setPendingRenameItemId = useFileStore((s) => s.setPendingRenameItemId);
  const currentFolderId = useFileStore((s) => s.currentFolderId);
  const notionInputRef = useRef<HTMLInputElement>(null);

  const [libraryId, setCurrentViewItemId, setMode] = useResourceManagerStore((s) => [
    s.libraryId,
    s.setCurrentViewItemId,
    s.setMode,
  ]);

  const handleOpenNoteEditor = async () => {
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
  };

  const handleCreateFolder = async () => {
    // Create folder with "Untitled" name immediately
    const folderId = await createFolder('Untitled', currentFolderId ?? undefined, libraryId);
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

            await uploadFolderWithStructure(filteredFiles, libraryId, currentFolderId ?? undefined);
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
  };

  const handleNotionImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { message } = await import('antd');

      // Show loading message
      const loadingKey = 'notion-import';
      message.loading({
        content: t('header.actions.notion.importing'),
        duration: 0,
        key: loadingKey,
      });

      // Unzip the file
      let files = await unzipFile(file);

      console.log(
        'Extracted files (level 1):',
        files.map((f) => ({ name: f.name, type: f.type })),
      );

      // Check if there are nested ZIP files (common in Notion exports)
      const nestedZips = files.filter((f) => f.name.toLowerCase().endsWith('.zip'));

      if (nestedZips.length > 0) {
        console.log(
          'Found nested ZIPs, extracting...',
          nestedZips.map((z) => z.name),
        );
        const allNestedFiles: File[] = [];

        for (const zipFile of nestedZips) {
          try {
            const nestedFiles = await unzipFile(zipFile);
            console.log(
              `Extracted from ${zipFile.name}:`,
              nestedFiles.map((f) => ({ name: f.name, type: f.type })),
            );
            allNestedFiles.push(...nestedFiles);
          } catch (error) {
            console.error(`Failed to extract nested ZIP ${zipFile.name}:`, error);
          }
        }

        // Replace files with nested content
        files = allNestedFiles;
      }

      console.log(
        'All extracted files:',
        files.map((f) => ({ name: f.name, type: f.type })),
      );

      // Filter for markdown files (case-insensitive, support both .md and .markdown)
      const mdFiles = files.filter((f) => {
        const name = f.name.toLowerCase();
        return name.endsWith('.md') || name.endsWith('.markdown');
      });

      if (mdFiles.length === 0) {
        message.destroy(loadingKey);
        message.warning(
          t('header.actions.notion.noMarkdownFiles') +
            ` (${t('header.actions.notion.foundFiles', { count: files.length })})`,
        );
        console.warn(
          'No markdown files found. All files:',
          files.map((f) => f.name),
        );
        return;
      }

      // Process each markdown file
      let successCount = 0;
      let failedCount = 0;

      for (const mdFile of mdFiles) {
        try {
          // Read file content
          let content = await mdFile.text();
          let title = '';

          // Check if first line is a heading (# Title)
          const lines = content.split('\n');
          const firstLine = lines[0]?.trim() || '';

          if (firstLine.startsWith('#')) {
            // Extract title from heading (remove # symbols and trim)
            title = firstLine.replace(/^#+\s*/, '').trim();
            // Remove the first line from content
            content = lines.slice(1).join('\n').trim();
          } else {
            // Fallback to filename without extension
            const filename = mdFile.name.split('/').pop() || 'Untitled';
            title = filename.replace(/\.md$/, '');
          }

          // Create document
          await createDocument({
            content,
            knowledgeBaseId: libraryId,
            parentId: currentFolderId ?? undefined,
            title,
          });

          successCount++;
        } catch (error) {
          console.error(`Failed to import ${mdFile.name}:`, error);
          failedCount++;
        }
      }

      // Show completion message
      message.destroy(loadingKey);

      if (failedCount === 0) {
        message.success(
          t('header.actions.notion.success', {
            count: successCount,
          }),
        );
      } else {
        message.warning(
          t('header.actions.notion.partial', {
            failed: failedCount,
            success: successCount,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to import Notion export:', error);
      const { message } = await import('antd');
      message.error(t('header.actions.notion.error'));
    }

    // Reset input to allow re-uploading
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
            onClick: () => {
              notionInputRef.current?.click();
            },
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
    [libraryId, currentFolderId, pushDockFileList],
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
