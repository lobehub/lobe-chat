'use client';

import { FileTypeIcon, Icon } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowUpIcon, FileTextIcon, PlusIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';

const ICON_SIZE = 64;

const useStyles = createStyles(({ css, token }) => ({
  actionTitle: css`
    margin-block-start: 12px;
    font-size: 14px;
    font-weight: 500;
    color: ${token.colorTextSecondary};
  `,
  card: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    min-height: 120px;
    padding: 16px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    font-weight: 500;
    text-align: center;

    background: ${token.colorBgContainer};

    transition: all ${token.motionDurationMid} ${token.motionEaseInOut};

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadowTertiary};
    }
  `,
  glow: css`
    position: absolute;
    inset-block-end: -12px;
    inset-inline-end: 0;

    width: 48px;
    height: 48px;

    opacity: 0.3;
    filter: blur(24px);
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 16px;

    @media (width >= 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (width >= 900px) {
      grid-template-columns: repeat(3, 1fr);
    }
  `,
  icon: css`
    position: absolute;
    z-index: 1;
    inset-block-end: -16px;
    inset-inline-end: 8px;

    flex: none;
  `,
}));

interface UploadEntriesProps {
  knowledgeBaseId?: string;
}

const UploadEntries = memo<UploadEntriesProps>(({ knowledgeBaseId }) => {
  const { t } = useTranslation('file');
  const theme = useTheme();
  const { styles } = useStyles();
  const [isUploading, setIsUploading] = useState(false);

  const createNote = useFileStore((s) => s.createNote);
  const pushDockFileList = useFileStore((s) => s.pushDockFileList);

  const handleCreateNote = () => {
    createNote({
      content: '',
      knowledgeBaseId,
      title: t('home.uploadEntries.newNote.defaultTitle'),
    });
  };

  const handleUploadMarkdown = async (file: File) => {
    try {
      setIsUploading(true);
      const content = await file.text();
      await createNote({
        content,
        knowledgeBaseId,
        title: file.name.replace(/\.md$|\.markdown$/i, ''),
      });
    } catch (error) {
      console.error('Failed to upload markdown:', error);
    } finally {
      setIsUploading(false);
    }
    return false;
  };

  const handleUploadFiles = async (file: File) => {
    try {
      await pushDockFileList([file], knowledgeBaseId);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
    return false;
  };

  return (
    <Flexbox className={styles.grid}>
      {/* Create New Note */}
      <Flexbox className={styles.card} onClick={handleCreateNote} padding={16}>
        <span className={styles.actionTitle}>{t('home.uploadEntries.newNote.title')}</span>
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
        <Flexbox className={styles.card} padding={16} style={{ opacity: isUploading ? 0.5 : 1 }}>
          <span className={styles.actionTitle}>
            {isUploading
              ? t('home.uploadEntries.markdown.uploading')
              : t('home.uploadEntries.markdown.title')}
          </span>
          <div className={styles.glow} style={{ background: theme.gold }} />
          <FileTypeIcon
            className={styles.icon}
            color={theme.gold}
            icon={<Icon color={'#fff'} icon={FileTextIcon} />}
            size={ICON_SIZE}
            type={'file'}
          />
        </Flexbox>
      </Upload>

      {/* Upload Files */}
      <Upload beforeUpload={handleUploadFiles} multiple showUploadList={false}>
        <Flexbox className={styles.card} padding={16}>
          <span className={styles.actionTitle}>{t('home.uploadEntries.files.title')}</span>
          <div className={styles.glow} style={{ background: theme.geekblue }} />
          <FileTypeIcon
            className={styles.icon}
            color={theme.geekblue}
            icon={<Icon color={'#fff'} icon={ArrowUpIcon} />}
            size={ICON_SIZE}
            type={'file'}
          />
        </Flexbox>
      </Upload>
    </Flexbox>
  );
});

export default UploadEntries;

