import { SVGProps } from 'react';

// eslint-disable-next-line no-undef
const LiveblocksIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg fill="none" height={32} width={32} xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        clipRule="evenodd"
        d="M21.657 8H2l5.657 5.6v7.733L21.657 8ZM10.343 24H30l-5.657-5.6v-7.733L10.343 24Z"
        fill="#000"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default LiveblocksIcon;
