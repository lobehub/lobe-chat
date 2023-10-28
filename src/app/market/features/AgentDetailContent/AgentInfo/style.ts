import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, prefixCls, stylish }) => ({
  author: css`
    font-size: 12px;
  `,

  avatar: css`
    flex: none;
  `,
  container: css`
    position: relative;
    padding: 16px 16px 24px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  date: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  desc: css`
    color: ${token.colorTextDescription};
    text-align: center;
  `,
  loading: css`
    .${prefixCls}-skeleton-content {
      display: flex;
      flex-direction: column;
    }
  `,
  markdown: stylish.markdownInChat,
  nav: css`
    padding-top: 4px;

    .${prefixCls}-tabs-tab {
      margin: 4px !important;

      + .${prefixCls}-tabs-tab {
        margin: 4px !important;
      }
    }
  `,
  title: css`
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  `,
}));
