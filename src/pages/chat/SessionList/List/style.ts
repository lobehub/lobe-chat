import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ css, token }, isHighlight: boolean) => {
  return {
    active: css`
      display: flex;
    `,
    button: css`
      position: sticky;
      z-index: 30;
      bottom: 0;

      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;

      margin-top: 8px;
      padding: 12px;

      background: ${rgba(token.colorBgLayout, 0.5)};
      backdrop-filter: blur(8px);
    `,
    container: css`
      position: relative;

      .session-remove {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-50%);

        opacity: ${isHighlight ? 1 : 0};
      }

      .session-time {
        opacity: ${isHighlight ? 0 : 1};
        transition: opacity 100ms ${token.motionEaseOut};
      }

      &:hover {
        .session-time {
          opacity: 0;
        }

        .session-remove {
          opacity: 1;
        }
      }
    `,
    hover: css`
      background-color: ${token.colorFillSecondary};
    `,
    pin: css`
      background-color: ${token.colorFillTertiary};
    `,
    time: css`
      align-self: flex-start;
    `,
  };
});
