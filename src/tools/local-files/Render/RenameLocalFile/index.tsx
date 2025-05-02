import { RenameLocalFileParams } from '@lobechat/electron-client-ipc';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowRightIcon } from 'lucide-react';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import FileIcon from '@/components/FileIcon';
import { LocalReadFileState } from '@/tools/local-files/type';
import { ChatMessagePluginError } from '@/types/message';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    color: ${token.colorTextQuaternary};
  `,
  new: css`
    color: ${token.colorTextSecondary};
  `,
}));

interface RenameLocalFileProps {
  args: RenameLocalFileParams;
  messageId: string;
  pluginError: ChatMessagePluginError;
  pluginState: LocalReadFileState;
}

const RenameLocalFile = memo<RenameLocalFileProps>(({ args }) => {
  const { styles } = useStyles();

  const oldFileName = args.path.split('/').at(-1);
  return (
    <Flexbox align={'center'} className={styles.container} gap={8} horizontal paddingInline={12}>
      <Flexbox>{oldFileName}</Flexbox>
      <Flexbox>
        <Icon icon={ArrowRightIcon} />
      </Flexbox>
      <Flexbox className={styles.new} gap={4} horizontal>
        <FileIcon fileName={args.newName} size={20} variant={'raw'} />
        {args.newName}
      </Flexbox>
    </Flexbox>
  );
});

export default RenameLocalFile;
