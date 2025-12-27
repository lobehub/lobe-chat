import { css } from 'antd-style';
import type { FullToken } from 'antd-style/lib/types';

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

export const shinyTextStylish = (tokenOrCssVar: FullToken | any) => {
  // Support both token and cssVar
  const colorText = tokenOrCssVar.colorText || tokenOrCssVar;
  const colorTextBase = tokenOrCssVar.colorTextBase || tokenOrCssVar;
  const colorTextSecondary = tokenOrCssVar.colorTextSecondary || tokenOrCssVar;

  return css`
    color: color-mix(in srgb, ${colorText} 45%, transparent);

    background: linear-gradient(
      120deg,
      color-mix(in srgb, ${colorTextBase} 0%, transparent) 40%,
      ${colorTextSecondary} 50%,
      color-mix(in srgb, ${colorTextBase} 0%, transparent) 60%
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
  ` as any;
};
