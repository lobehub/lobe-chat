'use client';

import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ComponentPropsWithRef, memo, useMemo } from 'react';

import { extractVariables } from '@/utils/keyboard';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 12px;
    cursor: pointer;
    border-radius: 5px;
    margin-block: 2px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    gap: 8px;

    &:hover {
      background: ${token.colorBgTextHover};
    }
  `,
  containerActive: css`
    background: ${token.colorInfoBgHover} !important;
  `,
  subtitle: css`
    font-size: 12px;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
  `,
  title: css`
    font-size: 16px;
    line-height: 1;
    display: inline-flex;
    gap: 8px;
    position: relative;
  `,
  variable: css``,
  variables: css`
    display: flex;
    flex-wrap: wrap;
  `,
}));

type Props = ComponentPropsWithRef<'div'> & {
  isActive?: boolean;
  subtitle: string;
  title: string;
};

const PromptSelectItem = memo<Props>(({ title, subtitle, isActive, ...props }) => {
  const { styles, theme, cx } = useStyles();
  const variables = useMemo(() => {
    return extractVariables(subtitle);
  }, [subtitle]);

  return (
    <div
      className={cx(styles.container, props.className, {
        [styles.containerActive]: isActive,
      })}
      {...props}
    >
      <div className={styles.title}>
        <div>{title}</div>
      </div>
      <div className={styles.subtitle} title={subtitle}>
        {subtitle}
      </div>
      {variables?.length > 0 && (
        <div className={styles.variables}>
          {variables.map((variable, i) => {
            return (
              <Tag
                bordered
                className={styles.variable}
                color={theme.colorBgTextActive}
                key={i}
                size={'small'}
              >
                {`{{ ${variable.name.trim()} }}`}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default PromptSelectItem;
