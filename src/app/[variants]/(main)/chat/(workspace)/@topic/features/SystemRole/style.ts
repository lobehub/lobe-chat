import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  animatedContainer: css`
    transition:
      height 0.3s ease,
      opacity 0.3s ease;
  `,
  prompt: css`
    overflow: hidden auto;

    padding-block: 0 16px;
    padding-inline: 16px;

    opacity: 0.75;

    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  promptBox: css`
    position: relative;
    overflow: hidden;
    border-block-end: 1px solid ${token.colorBorder};
  `,
  promptMask: css`
    pointer-events: none;

    position: absolute;
    z-index: 10;
    inset-block-end: 0;
    inset-inline-start: 0;

    width: 100%;
    height: 32px;

    background: linear-gradient(to bottom, transparent, ${token.colorBgLayout});
  `,
}));
