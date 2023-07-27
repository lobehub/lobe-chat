import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorSplit};
    border-radius: 8px;
  `,
  desc: css`
    color: ${token.colorTextTertiary};
    text-align: center;
  `,
}));
