import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { RunCommandParams, RunCommandResult } from '@lobechat/electron-client-ipc';
import { BuiltinRenderProps } from '@lobechat/types';
import { ActionIcon, Block, Highlighter, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    padding-inline: 8px 0;
  `,
  head: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
  header: css`
    .action-icon {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover {
      .action-icon {
        opacity: 1;
      }
    }
  `,
  statusIcon: css`
    font-size: 12px;
  `,
}));

interface RunCommandState {
  message: string;
  result: RunCommandResult;
}

const RunCommand = memo<BuiltinRenderProps<RunCommandParams, RunCommandState>>(
  ({ args, pluginState }) => {
    const { styles, theme } = useStyles();
    const { result, message } = pluginState || {};
    const isSuccess = result?.success;
    const [expanded, setExpanded] = useState(false);

    return (
      <Flexbox className={styles.container} gap={8}>
        {/* Header: Description + Status */}
        <Flexbox align={'center'} className={styles.header} horizontal justify={'space-between'}>
          <Flexbox gap={8} horizontal>
            <Flexbox gap={4} horizontal>
              {!result ? null : isSuccess ? (
                <CheckCircleFilled
                  className={styles.statusIcon}
                  style={{ color: theme.colorSuccess }}
                />
              ) : (
                <CloseCircleFilled
                  className={styles.statusIcon}
                  style={{ color: theme.colorError }}
                />
              )}
              {args.description && <Text className={styles.head}>{args.description}</Text>}
            </Flexbox>
            {message && (
              <Flexbox align={'center'} gap={4} horizontal>
                <Text className={styles.head} type={'secondary'}>
                  {message}
                </Text>
              </Flexbox>
            )}
          </Flexbox>
          <Flexbox align={'center'} gap={8} horizontal>
            <ActionIcon
              className={`action-icon`}
              icon={expanded ? ChevronUp : ChevronDown}
              onClick={() => setExpanded(!expanded)}
              size={'small'}
              style={{ opacity: expanded ? 1 : undefined }}
              title={expanded ? 'Collapse' : 'Expand'}
            />
          </Flexbox>
        </Flexbox>

        {/* Command & Output */}
        {expanded && (
          <Block gap={8} padding={8} variant={'outlined'}>
            <Highlighter
              language={'sh'}
              showLanguage={false}
              style={{ paddingInline: 8 }}
              variant={'borderless'}
              wrap
            >
              {args.command}
            </Highlighter>
            {result?.output && (
              <Highlighter language={'text'} showLanguage={false} variant={'filled'} wrap>
                {result.output}
              </Highlighter>
            )}
          </Block>
        )}
      </Flexbox>
    );
  },
);

export default RunCommand;
