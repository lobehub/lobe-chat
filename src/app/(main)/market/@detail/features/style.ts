import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, prefixCls }) => ({
  author: css`
    font-size: 12px;
  `,
  container: css`
    position: relative;
    padding-block: 16px 24px;
    padding-inline: 16px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
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
  time: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-block-end: 0;
    font-weight: bold;
    text-align: center;
  `,
}));
