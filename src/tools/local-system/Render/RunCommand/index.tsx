import { RunCommandParams } from '@lobechat/electron-client-ipc';
import { ChatMessagePluginError } from '@lobechat/types';
import { Highlighter, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LocalReadFileState } from '../../type';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    padding: 8px;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainerSecondary};
  `,
  head: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
}));

interface RunCommandProps {
  args: RunCommandParams;
  messageId: string;
  pluginError: ChatMessagePluginError;
  pluginState: LocalReadFileState;
}

const RunCommand = memo<RunCommandProps>(({ args }) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} gap={4}>
      {args.description && (
        <div>
          <Text className={styles.head} type={'secondary'}>
            {args.description}
          </Text>
        </div>
      )}
      <Highlighter language={'sh'} showLanguage={false} variant={'borderless'} wrap>
        {args.command}
      </Highlighter>
    </Flexbox>
  );
});

export default RunCommand;
