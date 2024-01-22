import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, stylish, cx }, withBackground: boolean) => ({
  background: css`
    padding: 24px;

    background-color: ${token.colorBgLayout};
    background-image: url('/images/screenshot_background.webp');
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
    border-top: 1px solid ${token.colorBorder};
  `,
  header: css`
    margin-bottom: -24px;
    padding: 16px;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorder};
  `,
  markdown: stylish.markdownInChat,
  preview: cx(
    stylish.noScrollbar,
    css`
      overflow: hidden scroll;

      width: 100%;
      max-height: 40dvh;

      background: ${token.colorBgLayout};
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;

      * {
        pointer-events: none;

        ::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
        }
      }
    `,
  ),
  role: css`
    margin-top: 12px;
    padding-top: 12px;
    opacity: 0.75;
    border-top: 1px dashed ${token.colorBorderSecondary};

    * {
      font-size: 12px !important;
    }
  `,
  url: css`
    color: ${token.colorTextDescription};
  `,
}));
