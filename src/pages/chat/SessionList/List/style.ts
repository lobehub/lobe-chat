import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ css, token }) => {
  return {
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
    `,

    modalRoot: css`
      z-index: 2000;
    `,
    pin: css`
      background-color: ${token.colorFillTertiary};
    `,
    time: css`
      align-self: flex-start;
    `,
  };
});
