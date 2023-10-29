import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  prompt: css`
    overflow: hidden auto;
    padding: 0 16px 16px;
    opacity: 0.75;
    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  promptBox: css`
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid ${token.colorBorder};
  `,
  promptMask: css`
    pointer-events: none;

    position: absolute;
    z-index: 10;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 32px;

    background: linear-gradient(to bottom, transparent, ${token.colorBgLayout});
  `,
}));
