import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ token, css, stylish, cx, responsive }) => ({
  button: cx(
    stylish.blur,
    css`
      padding-inline: 12px !important;
      border-color: ${token.colorFillTertiary} !important;
      border-radius: 16px !important;
      background: ${rgba(token.colorBgContainer, 0.5)};

      ${responsive.mobile} {
        &:last-child {
          border-inline-end: none;
          border-start-end-radius: 0 !important;
          border-end-end-radius: 0 !important;
        }
      }
    `,
  ),
  container: css`
    pointer-events: none;

    position: absolute;
    z-index: 50;
    inset-block-end: 16px;
    inset-inline-end: 16px;
    transform: translateY(16px);

    opacity: 0;

    ${responsive.mobile} {
      inset-inline-end: 0;
    }
  `,
  hide: css`
    display: none;
  `,
  visible: css`
    pointer-events: all;
    transform: translateY(0);
    opacity: 1;
  `,
}));
