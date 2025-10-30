import { FileTypeIcon, Icon, Text } from '@lobehub/ui';
import { Upload } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

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

interface NoteEmptyStatusProps {
  knowledgeBaseId?: string;
  onCreateNewNote: () => void;
}

const handleUploadMarkdown = async (file: File) => {
  // TODO: Implement markdown file upload
  console.log('Upload markdown file:', file);
  return false;
};

const NoteEmptyStatus = memo<NoteEmptyStatusProps>(({ onCreateNewNote }) => {
  const theme = useTheme();
  const { styles } = useStyles();

  return (
    <Center gap={24} height={'100%'} style={{ paddingBottom: 100 }} width={'100%'}>
      <Flexbox justify={'center'} style={{ textAlign: 'center' }}>
        <Text as={'h4'}>Select a note to edit its content</Text>
        <Text type={'secondary'}>Or</Text>
      </Flexbox>
      <Flexbox gap={12} horizontal>
        {/* Create New Note */}
        <Flexbox className={styles.card} onClick={onCreateNewNote} padding={16}>
          <span className={styles.actionTitle}>Create new note</span>
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
          multiple={false}
          showUploadList={false}
        >
          <Flexbox className={styles.card} padding={16}>
            <span className={styles.actionTitle}>Upload markdown</span>
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

        {/* Import from Notion */}
        {/* <Flexbox className={styles.card} onClick={handleImportFromNotion} padding={16}>
          <span className={styles.actionTitle}>Import from Notion</span>
          <div className={styles.glow} style={{ background: theme.geekblue }} />
          <FileTypeIcon
            className={styles.icon}
            color={theme.geekblue}
            icon={<Icon color={'#fff'} icon={FileTextIcon} />}
            size={ICON_SIZE}
            type={'doc'}
          />
        </Flexbox> */}
      </Flexbox>
    </Center>
  );
});

export default NoteEmptyStatus;
