'use client';

import { dark } from '@clerk/themes';
import { ElementsConfig, Theme } from '@clerk/types';
import { createStyles, useThemeMode } from 'antd-style';

const prefixCls = 'cl';

export const useStyles = createStyles(
  ({ css, token, isDarkMode }) =>
    ({
      avatarBox: css`
        width: 40px;
        height: 40px;
      `,
      cardBox: css`
        background: ${token.colorBgContainer};
        border-radius: ${token.borderRadiusLG}px;
        box-shadow: 0 0 0 1px ${token.colorBorderSecondary};
      `,
      header: css`
        gap: 1em;
      `,
      logoBox: css`
        height: 48px;
      `,
      modalBackdrop: css`
        background: ${token.colorBgMask};
        backdrop-filter: blur(2px);
      `,
      modalContent: css`
        &.${prefixCls}-modalContent {
          .${prefixCls}-cardBox {
            border: 1px solid ${token.colorSplit} !important;
            border-radius: ${token.borderRadiusLG}px !important;
            box-shadow: ${token.boxShadow} !important;
          }

          .${prefixCls}-userProfile-root {
            width: min(80vw, 55rem);
            height: min(80vh, 44rem);
          }
        }
      `,
      navbar: css`
        background: ${isDarkMode ? token.colorBgContainer : token.colorFillTertiary};
      `,
      navbarButton: css`
        line-height: 2;
      `,
      pageScrollBox: css`
        align-self: center;
        width: 100%;
        max-width: 1024px;
      `,
      rootBox: css`
        &.${prefixCls}-userProfile-root {
          width: 100%;
          height: 100%;

          .${prefixCls}-cardBox {
            width: 100%;
            height: 100%;

            border: unset;
            border-radius: unset;
            box-shadow: unset;
          }
        }
      `,
      scrollBox: css`
        background: ${isDarkMode ? token.colorFillQuaternary : token.colorBgElevated};
        border: unset;
        border-radius: unset;
        box-shadow: 0 1px 0 1px ${token.colorFillTertiary};
      `,
      socialButtons: css`
        display: flex;
        flex-direction: column;
      `,
      socialButtonsBlockButton__github: css`
        order: 1;
      `,
      socialButtonsBlockButton__google: css`
        order: -1;
      `,
    }) as Partial<{
      [k in keyof ElementsConfig]: any;
    }>,
);

export const useAppearance = () => {
  const { isDarkMode } = useThemeMode();
  const { styles, theme } = useStyles();

  return {
    baseTheme: isDarkMode ? dark : undefined,
    elements: styles,
    layout: {
      helpPageUrl: 'https://lobehub.com/docs',
      privacyPageUrl: 'https://lobehub.com/privacy',
      socialButtonsVariant: 'blockButton',
      termsPageUrl: 'https://lobehub.com/terms',
    },
    variables: {
      borderRadius: `${theme.borderRadius}px`,
      colorBackground: theme.colorBgContainer,
      colorDanger: theme.colorError,
      colorInputBackground: theme.colorFillTertiary,
      colorNeutral: theme.colorText,
      colorPrimary: theme.colorPrimary,
      colorSuccess: theme.colorSuccess,
      colorText: theme.colorText,
      colorTextSecondary: theme.colorTextDescription,
      colorWarning: theme.colorWarning,
      fontSize: `${theme.fontSize}px`,
    },
  } as Theme;
};
