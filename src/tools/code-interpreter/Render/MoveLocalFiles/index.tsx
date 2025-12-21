'use client';

import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { BuiltinRenderProps } from '@lobechat/types';
import { Block, Flexbox, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';

import { MoveLocalFilesState } from '../../type';

const useStyles = createStyles(({ css, token }) => ({
  arrow: css`
    color: ${token.colorTextSecondary};
  `,
  container: css`
    overflow: hidden;
    padding-inline: 8px 0;
  `,
  header: css`
    font-size: 12px;
  `,
  moveItem: css`
    padding-block: 4px;
    padding-inline: 8px;
    border-radius: 4px;
  `,
  path: css`
    font-family: ${token.fontFamilyCode};
    font-size: 11px;
  `,
  statusIcon: css`
    font-size: 12px;
  `,
}));

interface MoveLocalFilesParams {
  operations: Array<{
    destination: string;
    source: string;
  }>;
}

const MoveLocalFiles = memo<BuiltinRenderProps<MoveLocalFilesParams, MoveLocalFilesState>>(
  ({ pluginState }) => {
    const { styles, theme } = useStyles();

    if (!pluginState?.results) {
      return null;
    }

    const allSuccess = pluginState.successCount === pluginState.totalCount;

    return (
      <Flexbox className={styles.container} gap={8}>
        {/* Header */}
        <Flexbox align={'center'} gap={8} horizontal>
          {allSuccess ? (
            <CheckCircleFilled
              className={styles.statusIcon}
              style={{ color: theme.colorSuccess }}
            />
          ) : (
            <CloseCircleFilled className={styles.statusIcon} style={{ color: theme.colorError }} />
          )}
          <Text className={styles.header}>
            Moved {pluginState.successCount}/{pluginState.totalCount} items
          </Text>
        </Flexbox>

        {/* Move operations list */}
        <Block padding={8} style={{ maxHeight: 300, overflow: 'auto' }} variant={'outlined'}>
          <Flexbox gap={4}>
            {pluginState.results.map((result, index) => (
              <Flexbox
                align={'center'}
                className={styles.moveItem}
                gap={8}
                horizontal
                key={index}
                style={{
                  background: result.success ? theme.colorSuccessBg : theme.colorErrorBg,
                }}
              >
                {result.success ? (
                  <CheckCircleFilled style={{ color: theme.colorSuccess, fontSize: 12 }} />
                ) : (
                  <CloseCircleFilled style={{ color: theme.colorError, fontSize: 12 }} />
                )}
                <Text className={styles.path} ellipsis style={{ maxWidth: 200 }}>
                  {result.source}
                </Text>
                <ArrowRight className={styles.arrow} size={12} />
                <Text className={styles.path} ellipsis style={{ maxWidth: 200 }}>
                  {result.destination}
                </Text>
                {result.error && (
                  <Text className={styles.path} type={'danger'}>
                    ({result.error})
                  </Text>
                )}
              </Flexbox>
            ))}
          </Flexbox>
        </Block>
      </Flexbox>
    );
  },
);

MoveLocalFiles.displayName = 'MoveLocalFiles';

export default MoveLocalFiles;
