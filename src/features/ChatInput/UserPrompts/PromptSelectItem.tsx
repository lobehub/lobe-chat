'use client';

import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ComponentPropsWithRef, memo } from 'react';

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
  subtitle?: string;
  title?: string;
  variables?: string[];
};

const PromptSelectItem = memo<Props>(
  ({ title, subtitle, variables = ['name', 'code', 'issues'], isActive, ...props }) => {
    const { styles, theme, cx } = useStyles();

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
        {variables?.length && (
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
                  {`{{ ${variable} }}`}
                </Tag>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

export default PromptSelectItem;
