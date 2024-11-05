import { createStyles } from 'antd-style';

import { imageUrl } from '@/const/url';

export const useStyles = createStyles(({ css, token, cx }, withBackground: boolean) => ({
  background: css`
    padding: 24px;

    background-color: ${token.colorBgLayout};
    background-image: url(${imageUrl('screenshot_background.webp')});
    background-position: center;
    background-size: 120% 120%;
  `,
  container: cx(
    withBackground &&
      css`
        overflow: hidden;
        border: 2px solid ${token.colorBorder};
        border-radius: ${token.borderRadiusLG}px;
      `,

    css`
      background: ${token.colorBgLayout};
    `,
  ),
  footer: css`
    padding: 16px;
    border-block-start: 1px solid ${token.colorBorder};
  `,
  header: css`
    margin-block-end: -24px;
    padding: 16px;
    background: ${token.colorBgContainer};
    border-block-end: 1px solid ${token.colorBorder};
  `,
  role: css`
    margin-block-start: 12px;
    padding-block-start: 12px;
    opacity: 0.75;
    border-block-start: 1px dashed ${token.colorBorderSecondary};

    * {
      font-size: 12px !important;
    }
  `,
  url: css`
    color: ${token.colorTextDescription};
  `,
}));
