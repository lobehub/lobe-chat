import { ActionIcon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Trash2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { UploadFileItem } from '@/types/files/upload';

import UploadDetail from '../../../components/UploadDetail';
import Content from './Content';
import { FILE_ITEM_SIZE } from './style';

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

    width: ${FILE_ITEM_SIZE}px;
    min-width: ${FILE_ITEM_SIZE}px;
    height: ${FILE_ITEM_SIZE}px;
    border-radius: 8px;

    background: ${token.colorBgContainer};
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

const spacing = 8;

const FileItem = memo<FileItemProps>((props) => {
  const { file, uploadState, status, id, tasks } = props;
  const { t } = useTranslation(['chat', 'common']);
  const { styles } = useStyles();
  const [removeChatUploadFile] = useFileStore((s) => [s.removeChatUploadFile]);

  return (
    <Flexbox className={styles.container} distribution={'space-between'}>
      <Center flex={1} height={FILE_ITEM_SIZE - 46} padding={spacing}>
        <Content {...props} />
      </Center>
      <Flexbox gap={4} style={{ paddingBottom: 4, paddingInline: spacing }}>
        <Typography.Text ellipsis={{ tooltip: true }} style={{ fontSize: 12 }}>
          {file.name}
        </Typography.Text>

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
