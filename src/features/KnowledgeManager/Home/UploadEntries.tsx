'use client';

import { FileTypeIcon, Icon } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowUpIcon, FolderUp, PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

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

    width: 200px;
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
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: left;
  `,
  icon: css`
    position: absolute;
    z-index: 1;
    inset-block-end: -16px;
    inset-inline-end: 8px;

    flex: none;
  `,
  uploadWrapper: css`
    /* Make the wrapper transparent so hover passes through to the card */
    & > span {
      display: block;
    }
  `,
}));

interface UploadEntriesProps {
  knowledgeBaseId?: string;
}

const UploadEntries = memo<UploadEntriesProps>(({ knowledgeBaseId }) => {
  const { t } = useTranslation('file');
  const theme = useTheme();
  const { styles } = useStyles();
  const navigate = useNavigate();

  const createDocument = useFileStore((s) => s.createDocument);
  const pushDockFileList = useFileStore((s) => s.pushDockFileList);
  // const { open } = useCreateNewModal();

  const handleCreateNote = async () => {
    try {
      const newDoc = await createDocument({
        content: '',
        knowledgeBaseId,
        title: t('home.uploadEntries.newPage.title'),
      });
      // Navigate to the newly created document
      // The KnowledgeHomePage will automatically set category to 'documents' when it detects the id param
      navigate(`/${newDoc.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  // const handleCreateKnowledgeBase = () => {
  //   open({
  //     onSuccess: (id) => {
  //       navigate(`/bases/${id}`);
  //     },
  //   });
  // };

  const handleUploadFiles = async (file: File) => {
    try {
      await pushDockFileList([file], knowledgeBaseId);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
    return false;
  };

  const handleUploadFolder = async (file: File) => {
    try {
      await pushDockFileList([file], knowledgeBaseId);
    } catch (error) {
      console.error('Failed to upload folder:', error);
    }
    return false;
  };

  return (
    <div className={styles.grid}>
      {/* Create New Note */}
      <Flexbox className={styles.card} onClick={handleCreateNote} padding={16}>
        <span className={styles.actionTitle}>{t('home.uploadEntries.newPage.title')}</span>
        <div className={styles.glow} style={{ background: theme.purple }} />
        <FileTypeIcon
          className={styles.icon}
          color={theme.purple}
          icon={<Icon color={'#fff'} icon={PlusIcon} />}
          size={ICON_SIZE}
          type={'file'}
        />
      </Flexbox>

      {/* Create Knowledge Base */}
      {/* <Flexbox className={styles.card} onClick={handleCreateKnowledgeBase} padding={16}>
        <span className={styles.actionTitle}>{t('home.uploadEntries.knowledgeBase.title')}</span>
        <div className={styles.glow} style={{ background: theme.colorPrimary }} />
        <FileTypeIcon
          className={styles.icon}
          color={theme.colorPrimary}
          icon={<Icon color={'#fff'} icon={LibraryBig} />}
          size={ICON_SIZE}
          type={'file'}
        />
      </Flexbox> */}

      {/* Upload Files */}
      <Upload
        beforeUpload={handleUploadFiles}
        className={styles.uploadWrapper}
        multiple
        showUploadList={false}
      >
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

      {/* Upload Folder */}
      <Upload
        beforeUpload={handleUploadFolder}
        className={styles.uploadWrapper}
        directory
        multiple
        showUploadList={false}
      >
        <Flexbox className={styles.card} padding={16}>
          <span className={styles.actionTitle}>{t('home.uploadEntries.folder.title')}</span>
          <div className={styles.glow} style={{ background: theme.green }} />
          <FileTypeIcon
            className={styles.icon}
            color={theme.green}
            icon={<Icon color={'#fff'} icon={FolderUp} />}
            size={ICON_SIZE}
            type={'file'}
          />
        </Flexbox>
      </Upload>
    </div>
  );
});

export default UploadEntries;
