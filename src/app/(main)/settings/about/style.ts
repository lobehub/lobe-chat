import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;
  `,
  desc: css`
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-size: 16px;
    font-weight: 600;
  `,
  wrapper: css`
    width: 100%;

    ${responsive.mobile} {
      padding: 0 12px;
    }
  `,
}));
