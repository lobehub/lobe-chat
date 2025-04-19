import { ListLocalFileParams } from '@lobechat/electron-client-ipc';
import { ActionIcon } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { FolderOpen } from 'lucide-react';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { localFileService } from '@/services/electron/localFileService';
import { LocalFileListState } from '@/tools/local-files/type';
import { ChatMessagePluginError } from '@/types/message';

import SearchResult from './Result';

const useStyles = createStyles(({ css, token, cx }) => ({
  actions: cx(css`
    cursor: pointer;
    color: ${token.colorTextTertiary};
    opacity: 1;
    transition: opacity 0.2s ${token.motionEaseInOut};
  `),
  path: css`
    padding-inline-start: 8px;
    color: ${token.colorTextSecondary};
  `,
}));

interface ListFilesProps {
  args: ListLocalFileParams;
  messageId: string;
  pluginError: ChatMessagePluginError;
  pluginState?: LocalFileListState;
}

const ListFiles = memo<ListFilesProps>(({ messageId, pluginError, args, pluginState }) => {
  const { t } = useTranslation('tool');

  const { styles } = useStyles();
  return (
    <>
      <Flexbox gap={8} horizontal>
        <Typography.Text className={styles.path} ellipsis>
          {args.path}
        </Typography.Text>
        <Flexbox className={styles.actions} gap={8} horizontal style={{ marginLeft: 8 }}>
          <ActionIcon
            icon={FolderOpen}
            onClick={() => {
              localFileService.openLocalFolder({ isDirectory: true, path: args.path });
            }}
            size="small"
            title={t('localFiles.openFolder')}
          />
        </Flexbox>
      </Flexbox>
      <SearchResult
        listResults={pluginState?.listResults}
        messageId={messageId}
        pluginError={pluginError}
      />
    </>
  );
});

ListFiles.displayName = 'ListFiles';

export default ListFiles;
