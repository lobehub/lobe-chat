import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ css, token, stylish, cx }, withBackground: boolean) => ({
  background: css`
    padding: 24px;
    background: url('/images/screenshot_background.webp') no-repeat;
    background-size: 100% 100%;
  `,
  container: cx(
    withBackground &&
      css`
        overflow: hidden;
        border: 1px solid ${rgba(token.colorText, 0.15)};
        border-radius: ${token.borderRadiusLG}px;
        box-shadow:
          0 8px 16px -4px rgba(0, 0, 0, 75%),
          0 8px 24px -4px rgba(0, 0, 0, 75%);
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
  preview: cx(
    stylish.noScrollbar,
    css`
      overflow-x: hidden;
      overflow-y: scroll;

      width: 100%;
      max-height: 40vh;

      background: ${token.colorBgLayout};
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadiusLG}px;

      * {
        pointer-events: none;
        overflow: hidden;

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
