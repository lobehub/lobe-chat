import { Theme, css } from 'antd-style';

export default ({ token }: { prefixCls: string; token: Theme }) => css`
  .${token.prefixCls}-popover {
    z-index: 1100;
  }
  .${token.prefixCls}-dropdown {
    > ul {
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px !important;
      box-shadow: ${token.boxShadowSecondary};
    }
  }
`;
