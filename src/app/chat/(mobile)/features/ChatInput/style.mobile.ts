import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      padding: 12px 0;
      background: ${token.colorBgLayout};
      border-top: 1px solid ${rgba(token.colorBorder, 0.25)};
    `,
    inner: css`
      padding: 0 16px;
    `,
    input: css`
      background: ${token.colorFillSecondary} !important;
      border: none !important;
    `,
  };
});
