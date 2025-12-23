import { Center, FileTypeIcon, Flexbox, Icon, Text } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import NavHeader from '@/features/NavHeader';
import { useFileStore } from '@/store/file';
import { DocumentSourceType } from '@/types/document';

const ICON_SIZE = 80;

const useStyles = createStyles(({ css, token }) => ({
  actionTitle: css`
    margin-block-start: 12px;
    font-size: 16px;
    color: ${token.colorTextSecondary};
  `,
  card: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    width: 200px;
    height: 140px;
    border-radius: ${token.borderRadiusLG}px;

    font-weight: 500;
    text-align: center;

    background: ${token.colorFillTertiary};
    box-shadow: 0 0 0 1px ${token.colorFillTertiary} inset;

    transition: background 0.3s ease-in-out;

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  glow: css`
    position: absolute;
    inset-block-end: -12px;
    inset-inline-end: 0;

    width: 48px;
    height: 48px;

    opacity: 0.5;
    filter: blur(24px);
  `,
  icon: css`
    position: absolute;
    z-index: 1;
    inset-block-end: -24px;
    inset-inline-end: 8px;

    flex: none;
  `,
}));

interface PageExplorerPlaceholderProps {
  hasPages?: boolean;
  knowledgeBaseId?: string;
}

const PageExplorerPlaceholder = memo<PageExplorerPlaceholderProps>(
  ({ hasPages = false, knowledgeBaseId }) => {
    const { t } = useTranslation(['file', 'common']);

    const theme = useTheme();
    const { styles } = useStyles();
    const [isUploading, setIsUploading] = useState(false);
    const [
      createNewPage,
      createDocument,
      createOptimisticDocument,
      replaceTempDocumentWithReal,
      setSelectedPageId,
    ] = useFileStore((s) => [
      s.createNewPage,
      s.createDocument,
      s.createOptimisticDocument,
      s.replaceTempDocumentWithReal,
      s.setSelectedPageId,
    ]);

    const handleCreateDocument = async (content: string, title: string) => {
      if (!content) {
        // For empty pages, use createNewPage which handles optimistic updates
        await createNewPage(title);
        return;
      }

      // For markdown uploads with content, use optimistic pattern similar to createNewPage
      const tempPageId = createOptimisticDocument(title);
      // Set selected page to temp ID immediately (with URL update disabled for temp IDs)
      setSelectedPageId(tempPageId, false);

      try {
        const newDoc = await createDocument({
          content,
          knowledgeBaseId,
          title,
        });

        // Convert to LobeDocument format
        const realPage = {
          content: newDoc.content || '',
          createdAt: newDoc.createdAt ? new Date(newDoc.createdAt) : new Date(),
          editorData:
            typeof newDoc.editorData === 'string'
              ? JSON.parse(newDoc.editorData)
              : newDoc.editorData || null,
          fileType: 'custom/document' as const,
          filename: newDoc.title || title,
          id: newDoc.id,
          metadata: newDoc.metadata || {},
          source: 'document' as const,
          sourceType: DocumentSourceType.EDITOR,
          title: newDoc.title || title,
          totalCharCount: newDoc.content?.length || 0,
          totalLineCount: 0,
          updatedAt: newDoc.updatedAt ? new Date(newDoc.updatedAt) : new Date(),
        };

        // Replace optimistic with real
        replaceTempDocumentWithReal(tempPageId, realPage);
        // Update selected page ID and URL to the real page
        setSelectedPageId(newDoc.id);
      } catch (error) {
        console.error('Failed to create page:', error);
        // Remove temp document on error
        useFileStore.getState().removeTempDocument(tempPageId);
        setSelectedPageId(null);
        throw error;
      }
    };

    const handleUploadMarkdown = async (file: File) => {
      try {
        setIsUploading(true);

        // Read markdown file content
        const content = await file.text();

        // Create page with markdown content
        await handleCreateDocument(content, file.name.replace(/\.md$|\.markdown$/i, ''));
      } catch (error) {
        console.error('Failed to upload markdown:', error);
      } finally {
        setIsUploading(false);
      }

      return false; // Prevent default upload behavior
    };

    return (
      <>
        <NavHeader />
        <Center gap={24} height={'100%'} style={{ paddingBottom: 100 }} width={'100%'}>
          {hasPages && (
            <Flexbox justify={'center'} style={{ textAlign: 'center' }}>
              <Text as={'h4'}>{t('pageEditor.empty.title')}</Text>
              <Text type={'secondary'}>{t('or', { ns: 'common' })}</Text>
            </Flexbox>
          )}
          <Flexbox gap={12} horizontal>
            <Flexbox
              className={styles.card}
              onClick={() => handleCreateDocument('', t('pageList.untitled'))}
              padding={16}
            >
              <span className={styles.actionTitle}>{t('pageEditor.empty.createNewDocument')}</span>
              <div className={styles.glow} style={{ background: theme.purple }} />
              <FileTypeIcon
                className={styles.icon}
                color={theme.purple}
                icon={<Icon color={'#fff'} icon={PlusIcon} />}
                size={ICON_SIZE}
                type={'file'}
              />
            </Flexbox>

            {/* Upload Markdown File */}
            <Upload
              accept=".md,.markdown"
              beforeUpload={handleUploadMarkdown}
              disabled={isUploading}
              multiple={false}
              showUploadList={false}
            >
              <Flexbox
                className={styles.card}
                padding={16}
                style={{ opacity: isUploading ? 0.5 : 1 }}
              >
                <span className={styles.actionTitle}>
                  {isUploading ? 'Uploading...' : t('pageEditor.empty.uploadMarkdown')}
                </span>
                <div className={styles.glow} style={{ background: theme.gold }} />
                <FileTypeIcon
                  className={styles.icon}
                  color={theme.gold}
                  icon={<Icon color={'#fff'} icon={ArrowUpIcon} />}
                  size={ICON_SIZE}
                  type={'file'}
                />
              </Flexbox>
            </Upload>
          </Flexbox>
        </Center>
      </>
    );
  },
);

export default PageExplorerPlaceholder;
