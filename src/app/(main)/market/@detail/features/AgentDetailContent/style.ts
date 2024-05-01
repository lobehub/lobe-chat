import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, prefixCls }) => ({
  author: css`
    font-size: 12px;
  `,
  container: css`
    position: relative;
    padding: 16px 16px 24px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  desc: css`
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
  loading: css`
    .${prefixCls}-skeleton-content {
      display: flex;
      flex-direction: column;
    }
  `,
  nav: css`
    padding-top: 8px;
  `,
  time: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-bottom: 0;
    font-weight: bold;
    text-align: center;
  `,
}));
