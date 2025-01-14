import React, { memo } from 'react';

import Brave from './components/Brave';
import Chrome from './components/Chrome';
import Chromium from './components/Chromium';
import Edge from './components/Edge';
import Firefox from './components/Firefox';
import Opera from './components/Opera';
import Safari from './components/Safari';
import Samsung from './components/Samsung';

const lastVersion = {
  'Brave': Brave,
  'Chrome': Chrome,
  'Chromium': Chromium,
  'Edge': Edge,
  'Firefox': Firefox,
  'Mobile Safari': Safari,
  'Opera': Opera,
  'Safari': Safari,
  'Samsung': Samsung,
};

export type Browsers = keyof typeof lastVersion;

interface BrowserIconProps {
  browser: string;
  className?: string;
  size: number | string;
  style?: React.CSSProperties;
}

export const BrowserIcon = memo<BrowserIconProps>(({ browser, className, style, size }) => {
  const Component = lastVersion[browser as Browsers];

  if (!Component) return null;

  return (
    <Component
      className={className}
      height={size}
      style={{
        ...style,
        minHeight: size,
        minWidth: size,
      }}
      width={size}
    />
  );
});
