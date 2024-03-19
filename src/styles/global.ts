import { css } from 'antd-style';

import { isInStandaloneMode } from '@/utils/matchMedia';

export default ({ prefixCls }: { prefixCls: string }) => {
  // 当水合前也判断为 PWA，防止界面跳动
  const isPWA = typeof window === 'undefined' || isInStandaloneMode();
  return css`
    html,
    body,
    #__next,
    .${prefixCls}-app {
      position: relative;
      overscroll-behavior: none;
      height: ${isPWA ? '100vh' : '100%'} !important;
      max-height: ${isPWA ? '100vh' : '100dvh'} !important;

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
};
