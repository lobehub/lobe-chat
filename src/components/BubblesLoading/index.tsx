import type { IconType } from '@lobehub/icons';
import { css, cx, useTheme } from 'antd-style';
import { forwardRef, memo } from 'react';
import { Center } from 'react-layout-kit';

const container = css`
  circle {
    animation: bubble 1.5s cubic-bezier(0.05, 0.2, 0.35, 1) infinite;

    &:nth-child(2) {
      animation-delay: 0.3s;
    }

    &:nth-child(3) {
      animation-delay: 0.6s;
    }
  }

  @keyframes bubble {
    0% {
      opacity: 1;
    }

    25% {
      opacity: 0.5;
    }

    75% {
      opacity: 0.25;
    }

    to {
      opacity: 1;
    }
  }
`;

const BubblesLoadingIcon: IconType = forwardRef(
  ({ size = '1em', style, className, ...rest }, ref) => {
    return (
      <svg
        className={cx(container, className)}
        fill="currentColor"
        fillRule="evenodd"
        height={size}
        ref={ref}
        style={{ flex: 'none', lineHeight: 1, ...style }}
        viewBox="0 0 60 32"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
      >
        <circle cx="7" cy="16" r="6" />
        <circle cx="30" cy="16" r="6" />
        <circle cx="53" cy="16" r="6" />
      </svg>
    );
  },
);

const BubblesLoading = memo(() => {
  const theme = useTheme();
  return (
    <Center style={{ fill: theme.colorTextSecondary, height: 24, width: 32 }}>
      <BubblesLoadingIcon size={14} />
    </Center>
  );
});

export default BubblesLoading;
