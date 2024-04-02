import { css } from 'antd-style';

export default ({ prefixCls }: { prefixCls: string }) => css`
  html,
  body,
  #__next,
  .${prefixCls}-app {
    position: relative;
    overscroll-behavior: none;
    height: 100% !important;
    max-height: 100dvh !important;
  }

  * {
    scrollbar-width: thin;
  }

  p {
    margin-bottom: 0;
  }
`;
