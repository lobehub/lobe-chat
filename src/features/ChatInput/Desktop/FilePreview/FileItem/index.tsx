import { ActionIcon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Trash2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { UploadFileItem } from '@/types/files/upload';

import UploadDetail from '../../../components/UploadDetail';
import Content from './Content';

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    position: absolute;
    z-index: 10;
    inset-block-start: -4px;
    inset-inline-end: -4px;

    border-radius: 5px;

    background: ${token.colorBgElevated};
    box-shadow:
      0 0 0 0.5px ${token.colorFillSecondary} inset,
      ${token.boxShadowTertiary};
  `,
  container: css`
    position: relative;

    width: 180px;
    height: 64px;
    border-radius: 8px;

    background: ${token.colorBgContainer};

    :hover {
      background: ${token.colorBgElevated};
    }
  `,
  image: css`
    margin-block: 0 !important;
  `,
  status: css`
    &.ant-tag {
      padding-inline: 0;
      background: none;
    }
  `,
}));

type FileItemProps = UploadFileItem;

const FileItem = memo<FileItemProps>((props) => {
  const { file, uploadState, status, id, tasks } = props;
  const { t } = useTranslation(['chat', 'common']);
  const { styles } = useStyles();
  const [removeChatUploadFile] = useFileStore((s) => [s.removeChatUploadFile]);

  return (
    <Flexbox align={'center'} className={styles.container} horizontal>
      <Center flex={1} height={64} padding={4} style={{ maxWidth: 64 }}>
        <Content {...props} />
      </Center>
      <Flexbox flex={1} gap={4} style={{ paddingBottom: 4, paddingInline: 4 }}>
        <Text ellipsis={{ tooltip: true }} style={{ fontSize: 12, maxWidth: 100 }}>
          {file.name}
        </Text>

        <UploadDetail size={file.size} status={status} tasks={tasks} uploadState={uploadState} />
      </Flexbox>
      <Flexbox className={styles.actions}>
        <ActionIcon
          color={'red'}
          icon={Trash2Icon}
          onClick={() => {
            removeChatUploadFile(id);
          }}
          size={'small'}
          title={t('delete', { ns: 'common' })}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default FileItem;
