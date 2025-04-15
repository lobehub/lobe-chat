import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  prompt: css`
    opacity: 0.75;
    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  promptBox: css`
    position: relative;
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
}));
