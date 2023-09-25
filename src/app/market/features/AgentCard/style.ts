import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, responsive }) => ({
  avatar: css``,

  container: css`
    position: relative;
    overflow: hidden;
    border-radius: 11px;
  `,
  desc: css`
    color: ${token.colorTextDescription};
  `,
  inner: css`
    padding: 16px;
  `,
  subTitle: css`
    font-size: 24px;
    font-weight: 600;
    ${responsive.mobile} {
      font-size: 20px;
    }
  `,
  title: css`
    margin-bottom: 0 !important;
    font-size: 16px;
    font-weight: 600;
  `,
}));
