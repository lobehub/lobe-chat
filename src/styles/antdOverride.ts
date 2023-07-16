import { Theme, css } from 'antd-style';
import { rgba } from 'polished';

export default (token: Theme) => css`
  .ant-btn {
    box-shadow: none;
  }

  .ant-popover {
    z-index: 1100;
  }

  .ant-notification .ant-notification-notice.notification-primary-info {
    background: ${token.colorPrimary};
    box-shadow: 0 6px 16px 0 ${rgba(token.colorPrimary, 0.1)},
      0 3px 6px -4px ${rgba(token.colorPrimary, 0.2)},
      0 9px 28px 8px ${rgba(token.colorPrimary, 0.1)};

    .anticon {
      color: ${token.colorTextLightSolid};
    }

    .ant-notification-notice-message {
      margin-bottom: 0;
      padding-right: 0;
      color: ${token.colorTextLightSolid};
    }
  }
`;
