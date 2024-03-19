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

    ::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  }

  p {
    margin-bottom: 0;
  }

  @media (max-width: 575px) {
    * {
      ::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    }
  }
`;
