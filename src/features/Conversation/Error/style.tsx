import { createStyles } from 'antd-style';
import { PropsWithChildren } from 'react';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: ${token.paddingLG}px;
  `,
}));

export const FormAction = ({ children, ...props }: PropsWithChildren<any>) => (
  <div {...props}>{children}</div>
);
export const ErrorActionContainer = ({ children, ...props }: PropsWithChildren<any>) => (
  <div {...props}>{children}</div>
);
