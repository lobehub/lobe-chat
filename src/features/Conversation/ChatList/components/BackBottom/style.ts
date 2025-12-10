import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ token, css, stylish, cx }) => ({
  container: cx(
    stylish.blur,
    css`
      pointer-events: none;

      position: absolute;
      z-index: 50;
      inset-block-end: 16px;
      inset-inline-end: 16px;
      transform: translateY(16px);

      opacity: 0;
      background: ${rgba(token.colorBgElevated, 0.5)} !important;
    `,
  ),
  visible: css`
    pointer-events: all;
    transform: translateY(0);
    opacity: 1;
  `,
}));
