import { css } from 'antd-style';

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
