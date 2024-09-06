import React from 'react';

import { SVGComponent } from '../types';

export default ({ ...props }: SVGComponent) => {
  return (
    <svg
      aria-label="Samsung Internet"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect fill="#706CF5" height={512} rx="15%" width={512} />
      <g fill="none" stroke="#fff" strokeWidth={26}>
        <circle cx={256} cy={256} r={179} />
        <path d="M46 221a228 80 15 10441 118" stroke="#706CF5" />
        <path d="M105 160a228 80 15 10331 87" />
      </g>
    </svg>
  );
};
