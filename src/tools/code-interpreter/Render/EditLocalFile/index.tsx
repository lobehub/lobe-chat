'use client';

import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { BuiltinRenderProps } from '@lobechat/types';
import { ActionIcon, Block, Highlighter, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { EditLocalFileState } from '../../type';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    padding-inline: 8px 0;
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
  path: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
  stats: css`
    font-family: ${token.fontFamilyCode};
    font-size: 11px;
  `,
  statusIcon: css`
    font-size: 12px;
  `,
}));

interface EditLocalFileParams {
  all?: boolean;
  path: string;
  replace: string;
  search: string;
}

const EditLocalFile = memo<BuiltinRenderProps<EditLocalFileParams, EditLocalFileState>>(
  ({ args, pluginState }) => {
    const { styles, theme } = useStyles();
    const [expanded, setExpanded] = useState(false);
    const isSuccess = pluginState && pluginState.replacements > 0;

    const statsText =
      pluginState?.linesAdded || pluginState?.linesDeleted
        ? `+${pluginState.linesAdded || 0} -${pluginState.linesDeleted || 0}`
        : '';

    return (
      <Flexbox className={styles.container} gap={8}>
        {/* Header */}
        <Flexbox align={'center'} className={styles.header} horizontal justify={'space-between'}>
          <Flexbox align={'center'} gap={8} horizontal>
            {pluginState === undefined ? null : isSuccess ? (
              <CheckCircleFilled
                className={styles.statusIcon}
                style={{ color: theme.colorSuccess }}
              />
            ) : (
              <CloseCircleFilled className={styles.statusIcon} style={{ color: theme.colorError }} />
            )}
            <Text className={styles.path}>
              {pluginState?.replacements || 0} replacement(s) in {args.path}
            </Text>
            {statsText && (
              <Text className={styles.stats} type={'secondary'}>
                ({statsText})
              </Text>
            )}
          </Flexbox>
          {pluginState?.diffText && (
            <ActionIcon
              className={`action-icon`}
              icon={expanded ? ChevronUp : ChevronDown}
              onClick={() => setExpanded(!expanded)}
              size={'small'}
              style={{ opacity: expanded ? 1 : undefined }}
              title={expanded ? 'Hide diff' : 'Show diff'}
            />
          )}
        </Flexbox>

        {/* Diff view */}
        {expanded && pluginState?.diffText && (
          <Block padding={0} variant={'outlined'}>
            <Highlighter
              language={'diff'}
              showLanguage={false}
              style={{ maxHeight: 300, overflow: 'auto' }}
              variant={'borderless'}
              wrap
            >
              {pluginState.diffText}
            </Highlighter>
          </Block>
        )}
      </Flexbox>
    );
  },
);

EditLocalFile.displayName = 'EditLocalFile';

export default EditLocalFile;
