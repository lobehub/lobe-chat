import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  prompt: css`
    font-size: ${token.fontSizeSM}px;
    line-height: 1.6;
  `,
}));
