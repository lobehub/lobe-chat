import React from 'react';

import { SVGComponent } from '../types';

export default ({ ...props }: SVGComponent) => {
  return (
    <svg aria-label="Edge" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect fill="#fff" height={512} rx="15%" width={512} />
      <radialGradient cx={0.6} cy={0.5} id="prefix__a">
        <stop offset={0.8} stopColor="#148" />
        <stop offset={1} stopColor="#137" />
      </radialGradient>
      <radialGradient cx={0.5} cy={0.6} fx={0.2} fy={0.6} id="prefix__b">
        <stop offset={0.8} stopColor="#38c" />
        <stop offset={1} stopColor="#269" />
      </radialGradient>
      <linearGradient id="prefix__c" y1={0.5} y2={1}>
        <stop offset={0.1} stopColor="#5ad" />
        <stop offset={0.6} stopColor="#5c8" />
        <stop offset={0.8} stopColor="#7d5" />
      </linearGradient>
      <path
        d="M439 374c-50 77-131 98-163 96-191-9-162-262-47-261-82 52 30 224 195 157 17-12 20 3 15 8"
        fill="url(#prefix__a)"
      />
      <path
        d="M311 255c18-82-31-135-129-135S38 212 38 259c0 124 125 253 287 203-134 39-214-116-146-210 46-66 123-68 132 3M411 99h1"
        fill="url(#prefix__b)"
      />
      <path
        d="M39 253C51-15 419-30 472 202c14 107-86 149-166 115-42-26 26-20-3-99-48-112-251-103-264 35"
        fill="url(#prefix__c)"
      />
    </svg>
  );
};
