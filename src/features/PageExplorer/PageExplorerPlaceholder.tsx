import { FileTypeIcon, Icon, Text } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import NavHeader from '@/features/NavHeader';
import { useFileStore } from '@/store/file';

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
    const [createDocument, setSelectedPageId] = useFileStore((s) => [
      s.createDocument,
      s.setSelectedPageId,
    ]);

    const handleCreateDocument = async (content: string, title: string) => {
      const newDoc = await createDocument({
        content,
        knowledgeBaseId,
        title,
      });
      // Navigate to the newly created page
      setSelectedPageId(newDoc.id);
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
              <Text as={'h4'}>{t('documentEditor.empty.title')}</Text>
              <Text type={'secondary'}>{t('or', { ns: 'common' })}</Text>
            </Flexbox>
          )}
          <Flexbox gap={12} horizontal>
            <Flexbox
              className={styles.card}
              onClick={() => handleCreateDocument('', t('documentList.untitled'))}
              padding={16}
            >
              <span className={styles.actionTitle}>
                {t('documentEditor.empty.createNewDocument')}
              </span>
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
                  {isUploading ? 'Uploading...' : t('documentEditor.empty.uploadMarkdown')}
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
