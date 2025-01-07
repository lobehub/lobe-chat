import { FileTypeIcon, Icon } from '@lobehub/ui';
import { Typography, Upload } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ArrowUpIcon, PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useCreateNewModal } from '@/features/KnowledgeBaseModal';
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

interface EmptyStatusProps {
  knowledgeBaseId?: string;
  showKnowledgeBase: boolean;
}
const EmptyStatus = ({ showKnowledgeBase, knowledgeBaseId }: EmptyStatusProps) => {
  const { t } = useTranslation('components');
  const theme = useTheme();
  const { styles } = useStyles();

  const pushDockFileList = useFileStore((s) => s.pushDockFileList);

  const { open } = useCreateNewModal();

  return (
    <Center gap={24} height={'100%'} style={{ paddingBottom: 100 }} width={'100%'}>
      <Flexbox justify={'center'} style={{ textAlign: 'center' }}>
        <Typography.Title level={4}>{t('FileManager.emptyStatus.title')}</Typography.Title>
        <Typography.Text type={'secondary'}>{t('FileManager.emptyStatus.or')}</Typography.Text>
      </Flexbox>
      <Flexbox gap={12} horizontal>
        {showKnowledgeBase && (
          <Flexbox
            className={styles.card}
            onClick={() => {
              open();
            }}
            padding={16}
          >
            <span className={styles.actionTitle}>
              {t('FileManager.emptyStatus.actions.knowledgeBase')}
            </span>
            <div className={styles.glow} style={{ background: theme.purple }} />
            <FileTypeIcon
              className={styles.icon}
              color={theme.purple}
              icon={<Icon color={'#fff'} icon={PlusIcon} />}
              size={ICON_SIZE}
              type={'folder'}
            />
          </Flexbox>
        )}
        <Upload
          beforeUpload={async (file) => {
            await pushDockFileList([file], knowledgeBaseId);

            return false;
          }}
          multiple={true}
          showUploadList={false}
        >
          <Flexbox className={styles.card} padding={16}>
            <span className={styles.actionTitle}>{t('FileManager.emptyStatus.actions.file')}</span>
            <div className={styles.glow} style={{ background: theme.gold }} />
            <FileTypeIcon
              className={styles.icon}
              color={theme.gold}
              icon={<Icon color={'#fff'} icon={ArrowUpIcon} />}
              size={ICON_SIZE}
            />
          </Flexbox>
        </Upload>
        <Upload
          beforeUpload={async (file) => {
            await pushDockFileList([file], knowledgeBaseId);

            return false;
          }}
          directory
          multiple={true}
          showUploadList={false}
        >
          <Flexbox className={styles.card} padding={16}>
            <span className={styles.actionTitle}>
              {t('FileManager.emptyStatus.actions.folder')}
            </span>
            <div className={styles.glow} style={{ background: theme.geekblue }} />
            <FileTypeIcon
              className={styles.icon}
              color={theme.geekblue}
              icon={<Icon color={'#fff'} icon={ArrowUpIcon} />}
              size={ICON_SIZE}
              type={'folder'}
            />
          </Flexbox>
        </Upload>
      </Flexbox>
    </Center>
  );
};

export default EmptyStatus;
