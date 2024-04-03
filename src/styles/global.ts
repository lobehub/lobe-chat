import { Theme, css } from 'antd-style';

export default ({ prefixCls, token }: { prefixCls: string; token: Theme }) => css`
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
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;
  }

  p {
    margin-bottom: 0;
  }
`;
