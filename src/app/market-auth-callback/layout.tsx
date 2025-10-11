import { ReactNode } from 'react';

interface MarketAuthCallbackLayoutProps {
  children: ReactNode;
}

const MarketAuthCallbackLayout = ({ children }: MarketAuthCallbackLayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>Market Auth Callback</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default MarketAuthCallbackLayout;
