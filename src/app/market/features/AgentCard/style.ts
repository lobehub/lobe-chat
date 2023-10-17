import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    position: relative;
    overflow: hidden;
    border-radius: 11px;
    ${responsive.mobile} {
      border-radius: unset;
    }
  `,
  desc: css`
    color: ${token.colorTextDescription};
  `,
  inner: css`
    padding: 16px;
  `,
  lazy: css`
    min-height: 232px;
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
