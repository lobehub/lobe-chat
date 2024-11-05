import { createStyles } from 'antd-style';

export const useContainerStyles = createStyles(({ css, token, stylish, cx, responsive }) => ({
  preview: cx(
    stylish.noScrollbar,
    css`
      overflow: hidden scroll;

      width: 100%;
      max-height: 70dvh;

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

      ${responsive.mobile} {
        max-height: 40dvh;
      }
    `,
  ),
}));
