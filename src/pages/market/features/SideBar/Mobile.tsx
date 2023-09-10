import { ActionIcon } from '@lobehub/ui';
import { Drawer } from 'antd';
import { useTheme } from 'antd-style';
import { X } from 'lucide-react';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useMarketStore } from '@/store/market';

const Mobile = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  const [showAgentSidebar, toggleConfig] = useMarketStore((s) => [
    s.showAgentSidebar,
    s.toggleMarketSideBar,
  ]);

  const { t } = useTranslation('market');

  return (
    <Drawer
      bodyStyle={{ padding: 0 }}
      closeIcon={<ActionIcon icon={X} size={{ blockSize: 32, fontSize: 20 }} />}
      drawerStyle={{ background: theme.colorBgContainer }}
      headerStyle={{ padding: '8px 4px' }}
      height={'75vh'}
      onClose={() => toggleConfig(false)}
      open={showAgentSidebar}
      placement={'bottom'}
      title={t('sidebar.title')}
    >
      {children}
    </Drawer>
  );
});

export default Mobile;
