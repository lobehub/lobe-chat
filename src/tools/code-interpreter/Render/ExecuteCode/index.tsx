'use client';

import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { BuiltinRenderProps } from '@lobechat/types';
import { ActionIcon, Block, Highlighter, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ExecuteCodeState } from '../../type';

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

interface ExecuteCodeParams {
  code: string;
  language?: 'javascript' | 'python' | 'typescript';
}

const languageDisplayNames: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
};

const ExecuteCode = memo<BuiltinRenderProps<ExecuteCodeParams, ExecuteCodeState>>(
  ({ args, pluginState }) => {
    const { styles, theme } = useStyles();
    const isSuccess = pluginState?.success;
    const [expanded, setExpanded] = useState(false);

    const language = args.language || 'python';
    const displayLanguage = languageDisplayNames[language] || language;

    const statusMessage = pluginState?.success
      ? 'Execution completed'
      : pluginState?.error || 'Execution failed';

    return (
      <Flexbox className={styles.container} gap={8}>
        {/* Header: Language + Status */}
        <Flexbox align={'center'} className={styles.header} horizontal justify={'space-between'}>
          <Flexbox gap={8} horizontal>
            <Flexbox gap={4} horizontal>
              {pluginState === undefined ? null : isSuccess ? (
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
              <Text className={styles.head}>{displayLanguage}</Text>
            </Flexbox>
            <Text className={styles.head} type={'secondary'}>
              {statusMessage}
            </Text>
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

        {/* Code & Output */}
        {expanded && (
          <Block gap={8} padding={8} variant={'outlined'}>
            <Highlighter
              language={language}
              showLanguage={false}
              style={{ paddingInline: 8 }}
              variant={'borderless'}
              wrap
            >
              {args.code}
            </Highlighter>
            {pluginState?.output && (
              <Highlighter language={'text'} showLanguage={false} variant={'filled'} wrap>
                {pluginState.output}
              </Highlighter>
            )}
            {pluginState?.stderr && (
              <Highlighter language={'text'} showLanguage={false} variant={'filled'} wrap>
                {pluginState.stderr}
              </Highlighter>
            )}
          </Block>
        )}
      </Flexbox>
    );
  },
);

ExecuteCode.displayName = 'ExecuteCode';

export default ExecuteCode;
