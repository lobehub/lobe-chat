import { createGlobalStyle, createStyles } from 'antd-style';
import { rgba } from 'polished';

export const NOTIFICATION_PRIMARY = 'notification-primary-info';

export const useStyles = createStyles(({ css, token }) => ({
  bg: css`
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;

    background: ${token.colorBgLayout};
    background-image: linear-gradient(
      180deg,
      ${token.colorBgContainer} 0%,
      rgba(255, 255, 255, 0) 20%
    );

    :has(#ChatLayout, #FlowLayout) {
      overflow: hidden;
    }
  `,
}));

export const GlobalStyle = createGlobalStyle`
  .ant-btn {
    box-shadow: none;
  }

  #__next {
    height: 100%;
  }

  p {
    margin-bottom: 0;
  }

  li {
    display: block;
  }

  .ant-btn-default:not(:disabled):not(.ant-btn-dangerous) {
    border-color: transparent;

    &:hover {
      color: ${(p) => p.theme.colorText};
      background: ${({ theme }) => (theme.isDarkMode ? theme.colorFill : theme.colorFillTertiary)};
      border-color: transparent;
    }
  }

  .ant-popover {
    z-index: 1100;
  }


  /* 定义滚动槽的样式 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    margin-right: 4px;
    background-color: transparent; /* 定义滚动槽的背景色 */

    &-thumb {
      background-color: ${({ theme }) => theme.colorFill}; /* 定义滚动块的背景色 */
      border-radius: 4px; /* 定义滚动块的圆角半径 */
    }

    &-corner {
      display: none;
    }
  }

  .ant-notification .ant-notification-notice.${NOTIFICATION_PRIMARY} {
    background: ${(p) => p.theme.colorPrimary};
    box-shadow: 0 6px 16px 0 ${({ theme }) => rgba(theme.colorPrimary, 0.1)},
    0 3px 6px -4px ${({ theme }) => rgba(theme.colorPrimary, 0.2)},
    0 9px 28px 8px ${({ theme }) => rgba(theme.colorPrimary, 0.1)};

    .anticon {
      color: ${(p) => p.theme.colorTextLightSolid}
    }

    .ant-notification-notice-message {
      margin-bottom: 0;
      padding-right: 0;
      color: ${(p) => p.theme.colorTextLightSolid};
    }
  }

`;
