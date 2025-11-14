import { Highlighter } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { parse } from 'partial-json';
import { ReactNode, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useYamlArguments } from '@/hooks/useYamlArguments';

import ObjectEntity from './ObjectEntity';

const useStyles = createStyles(({ css, token, cx }) => ({
  button: css`
    color: ${token.colorTextSecondary};

    &:hover {
      color: ${token.colorText};
    }
  `,
  codeContainer: css`
    border-radius: ${token.borderRadiusLG}px;
  `,
  container: css`
    position: relative;

    overflow: auto;

    max-height: 200px;
    padding-block: 4px;
    padding-inline: 12px 64px;
    border-radius: ${token.borderRadiusLG}px;

    font-family: ${token.fontFamilyCode};
    font-size: 13px;
    line-height: 1.5;

    background: ${token.colorFillQuaternary};

    pre {
      margin: 0 !important;
      background: none !important;
    }

    &:hover {
      .actions {
        opacity: 1;
      }
    }
  `,
  editButton: cx(
    'actions',
    css`
      position: absolute;
      z-index: 10;
      inset-block-start: 4px;
      inset-inline-end: 4px;

      opacity: 0;

      transition: opacity 0.2s ${token.motionEaseInOut};
    `,
  ),
}));

export interface ArgumentsProps {
  actions?: ReactNode;
  arguments?: string;
  shine?: boolean;
}

const Arguments = memo<ArgumentsProps>(({ arguments: args = '', shine, actions }) => {
  const { styles } = useStyles();

  const displayArgs = useMemo(() => {
    try {
      const obj = parse(args);
      if (Object.keys(obj).length === 0) return {};
      return obj;
    } catch {
      return args;
    }
  }, [args]);

  const yaml = useYamlArguments(args);

  const showActions = !!actions;

  if (typeof displayArgs === 'string') {
    return (
      !!yaml && (
        <div className={styles.container}>
          <Highlighter language={'yaml'} showLanguage={false}>
            {yaml}
          </Highlighter>
        </div>
      )
    );
  }

  // if (args.length > 100) {
  //   return (
  //     <Highlighter language={'json'} showLanguage={false} variant={'filled'}>
  //       {JSON.stringify(displayArgs, null, 2)}
  //     </Highlighter>
  //   );
  // }

  const hasMinWidth = Object.keys(displayArgs).length > 1;

  if (Object.keys(displayArgs).length === 0) return null;

  return (
    <div className={styles.container}>
      {showActions && (
        <Flexbox className={styles.editButton} gap={4} horizontal>
          {actions}
        </Flexbox>
      )}
      <Flexbox>
        {Object.entries(displayArgs).map(([key, value]) => {
          return (
            <ObjectEntity
              editable={false}
              hasMinWidth={hasMinWidth}
              key={key}
              objectKey={key}
              shine={shine}
              value={value}
            />
          );
        })}
      </Flexbox>
    </div>
  );
});

export default Arguments;
