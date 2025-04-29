import { ListLocalFileParams } from '@lobechat/electron-client-ipc';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
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
  container: css`
    cursor: pointer;

    padding-block: 2px;
    padding-inline: 4px;
    border-radius: 4px;

    color: ${token.colorTextSecondary};

    :hover {
      color: ${token.colorText};
      background: ${token.colorFillTertiary};
    }
  `,
  path: css`
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
  const { styles } = useStyles();
  return (
    <>
      <Flexbox
        className={styles.container}
        gap={8}
        horizontal
        onClick={() => {
          localFileService.openLocalFolder({ isDirectory: true, path: args.path });
        }}
      >
        <FileIcon fileName={args.path} isDirectory size={22} variant={'raw'} />
        <Typography.Text className={styles.path} ellipsis>
          {args.path}
        </Typography.Text>
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
