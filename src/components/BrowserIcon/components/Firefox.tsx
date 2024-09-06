import React from 'react';

import { SVGComponent } from '../types';

export default ({ ...props }: SVGComponent) => {
  return (
    <svg aria-label="Firefox" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <linearGradient id="prefix__a" x1={0.7} x2={0.3} y2={0.8}>
        <stop offset={0.3} stopColor="#fd5" />
        <stop offset={0.6} stopColor="#f85" />
        <stop offset={1} stopColor="#d06" />
      </linearGradient>
      <radialGradient cx={0.4} cy={0.7} id="prefix__b">
        <stop offset={0.4} stopColor="#74d" />
        <stop offset={1} stopColor="#a2d" />
      </radialGradient>
      <linearGradient id="prefix__c" x1={0.8} x2={0.4} y1={0.2} y2={0.8}>
        <stop offset={0.2} stopColor="#fd5" />
        <stop offset={1} stopColor="#f33" />
      </linearGradient>
      <g transform="scale(4)">
        <path
          d="M48 49s-3-9-1-16c-9 2-33 35-33 35a51 48 0 1087-32s5 9 5 15c-3-9-20-25-26-37-24 13-16 39-16 39"
          fill="url(#prefix__a)"
        />
        <circle cx={64} cy={67} fill="url(#prefix__b)" r={26} />
        <path
          d="M21 45l43 12c-6 11-16 3-23 14a22 22 0 1034-20s33 3 17 42H28m36 25h1"
          fill="url(#prefix__a)"
        />
        <path
          d="M35 43c16 0 12 7 29 14-18 6-23-9-38 0 5 9 12 8 12 8 1 43 72 29 67-17a50 46.6 47 01-88 33c-9-18-1-40 16-51"
          fill="url(#prefix__c)"
        />
      </g>
    </svg>
  );
};
