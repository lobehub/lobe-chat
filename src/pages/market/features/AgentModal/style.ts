import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  author: css`
    font-size: 12px;
  `,

  avatar: css`
    flex: none;
  `,
  container: css`
    position: relative;
    overflow: hidden;
    border-radius: 11px;
  `,
  date: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  desc: css`
    color: ${token.colorTextDescription};
  `,
  prompt: css`
    padding: 16px;
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
  `,
  title: css`
    overflow: hidden;
    width: 288px;
    font-size: 16px;
    font-weight: 600;
  `,
}));
