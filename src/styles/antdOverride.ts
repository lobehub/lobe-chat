import { Theme, css } from 'antd-style';
import { readableColor } from 'polished';

export default ({ token, prefixCls }: { prefixCls: string; token: Theme }) => css`
  .${prefixCls}-btn {
    box-shadow: none;
  }

  .${prefixCls}-popover {
    z-index: 1100;
  }

  .${prefixCls}-slider-track, .${prefixCls}-tabs-ink-bar, .${prefixCls}-switch-checked {
    background: ${token.colorPrimary} !important;
  }

  .${prefixCls}-btn-primary:not(.${prefixCls}-btn-dangerous) {
    color: ${readableColor(token.colorPrimary)};
    background: ${token.colorPrimary};

    &:hover {
      color: ${readableColor(token.colorPrimary)} !important;
      background: ${token.colorPrimaryHover} !important;
    }

    &:active {
      color: ${readableColor(token.colorPrimaryActive)} !important;
      background: ${token.colorPrimaryActive} !important;
    }
  }
`;
