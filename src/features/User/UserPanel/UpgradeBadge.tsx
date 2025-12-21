import { Flexbox } from '@lobehub/ui';
import { Badge, ConfigProvider } from 'antd';
import { PropsWithChildren, memo } from 'react';

const UpgradeBadge = memo(({ children, showBadge }: PropsWithChildren<{ showBadge?: boolean }>) => {
  if (!showBadge) return children;

  return (
    <Flexbox>
      <ConfigProvider theme={{ components: { Badge: { dotSize: 8 } } }}>
        <Badge dot offset={[-4, 4]}>
          {children}
        </Badge>
      </ConfigProvider>
    </Flexbox>
  );
});

export default UpgradeBadge;
