import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ css, token, cx, stylish }) => {
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

        width: 16px;
        height: 16px;

        font-size: 10px;

        opacity: 0;
        background-color: ${token.colorFillTertiary};

        transition: color 600ms ${token.motionEaseOut}, scale 400ms ${token.motionEaseOut},
          background-color 100ms ${token.motionEaseOut}, opacity 100ms ${token.motionEaseOut};

        &:hover {
          background-color: ${token.colorFill};
        }
      }

      .session-time {
        opacity: 1;
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
    list: cx(
      stylish.noScrollbar,
      css`
        overflow-x: hidden;
        overflow-y: scroll;
      `,
    ),
    time: css`
      align-self: flex-start;
    `,
  };
});
