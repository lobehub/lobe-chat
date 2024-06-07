import { Theme, css } from 'antd-style';

export default ({ token }: { prefixCls: string; token: Theme }) => css`
  .${token.prefixCls}-popover {
    z-index: 1100;
  }

  .${token.prefixCls}-menu-sub.${token.prefixCls}-menu-vertical {
    border: 1px solid ${token.colorBorder};
    box-shadow: ${token.boxShadow};
  }

  .${token.prefixCls}-menu-item-selected {
    .${token.prefixCls}-menu-title-content {
      color: ${token.colorText};
    }
  }
`;
