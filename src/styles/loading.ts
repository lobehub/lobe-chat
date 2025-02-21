import { css } from 'antd-style';
import type { FullToken } from 'antd-style/lib/types';
import { rgba } from 'polished';

export const dotLoading = css`
  &::after {
    content: '\\2026'; /* ascii code for the ellipsis character */

    overflow: hidden;
    display: inline-block;

    width: 0;

    vertical-align: bottom;

    animation: ellipsis steps(4, end) 900ms infinite;
  }

  @keyframes ellipsis {
    to {
      width: 1.25em;
    }
  }

  @keyframes ellipsis {
    to {
      width: 1.25em;
    }
  }
`;

export const shinyTextStylish = (token: FullToken) => css`
  color: ${rgba(token.colorText, 0.45)};

  background: linear-gradient(
    120deg,
    ${rgba(token.colorTextBase, 0)} 40%,
    ${token.colorTextSecondary} 50%,
    ${rgba(token.colorTextBase, 0)} 60%
  );
  background-clip: text;
  background-size: 200% 100%;

  animation: shine 1.5s linear infinite;

  @keyframes shine {
    0% {
      background-position: 100%;
    }

    100% {
      background-position: -100%;
    }
  }
`;
