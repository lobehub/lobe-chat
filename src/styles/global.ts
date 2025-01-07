import { Theme, css } from 'antd-style';

// fix ios input keyboard
// overflow: hidden;
// ref: https://zhuanlan.zhihu.com/p/113855026
export default ({ token }: { prefixCls: string; token: Theme }) => css`
  html,
  body,
  #__next {
    position: relative;

    overscroll-behavior: none;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    background: ${token.colorBgLayout};

    @media (min-device-width: 576px) {
      overflow: hidden;
    }
  }

  * {
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    :hover::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      background-color: ${token.colorText};
      background-clip: content-box;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }
`;
