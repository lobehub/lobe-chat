import { css, cx, useTheme } from 'antd-style';
import { Center } from 'react-layout-kit';

const container = css`
  circle {
    animation: bubble 1.5s cubic-bezier(0.05, 0.2, 0.35, 1) infinite;
  }

  circle:nth-child(2) {
    animation-delay: 0.3s;
  }

  circle:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes bubble {
    0% {
      opacity: 1;

      /* transform: translateY(0); */
    }

    25% {
      opacity: 0.5;

      /* transform: translateY(-4px); */
    }

    75% {
      opacity: 0.25;

      /* transform: translateY(4px); */
    }

    to {
      opacity: 1;

      /* transform: translateY(0); */
    }
  }
`;

const Svg = () => (
  <svg className={cx(container)} viewBox="0 0 60 32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="16" r="6"></circle>
    <circle cx="30" cy="16" r="6"></circle>
    <circle cx="53" cy="16" r="6"></circle>
  </svg>
);

const BubblesLoading = () => {
  const theme = useTheme();
  return (
    <Center style={{ fill: theme.colorTextSecondary, height: 24, width: 32 }}>
      <Svg />
    </Center>
  );
};

export default BubblesLoading;
