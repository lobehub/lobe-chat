'use client';

import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { BuiltinRenderProps } from '@lobechat/types';
import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { WriteLocalFileState } from '../../type';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    padding-inline: 8px 0;
  `,
  path: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
  statusIcon: css`
    font-size: 12px;
  `,
}));

interface WriteLocalFileParams {
  content: string;
  createDirectories?: boolean;
  path: string;
}

const WriteFile = memo<BuiltinRenderProps<WriteLocalFileParams, WriteLocalFileState>>(
  ({ args, pluginState }) => {
    const { styles, theme } = useStyles();
    const isSuccess = pluginState?.success;

    return (
      <Flexbox className={styles.container} gap={8}>
        <Flexbox align={'center'} gap={8} horizontal>
          {pluginState === undefined ? null : isSuccess ? (
            <CheckCircleFilled className={styles.statusIcon} style={{ color: theme.colorSuccess }} />
          ) : (
            <CloseCircleFilled className={styles.statusIcon} style={{ color: theme.colorError }} />
          )}
          <Text className={styles.path}>
            {isSuccess ? `✅ Written to ${args.path}` : `❌ Failed to write ${args.path}`}
          </Text>
          {pluginState?.bytesWritten !== undefined && (
            <Text className={styles.path} type={'secondary'}>
              ({pluginState.bytesWritten} bytes)
            </Text>
          )}
        </Flexbox>
      </Flexbox>
    );
  },
);

WriteFile.displayName = 'WriteFile';

export default WriteFile;
