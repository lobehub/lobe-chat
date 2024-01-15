import { Theme, css } from 'antd-style';

export default ({ token }: { prefixCls: string; token: Theme }) => css`
  .${token.prefixCls}-popover {
    z-index: 1100;
  }

  .${token.prefixCls}-popover-inner {
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowSecondary};
  }

  ul.${token.prefixCls}-dropdown-menu {
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px !important;
    box-shadow: ${token.boxShadowSecondary};
  }
`;
