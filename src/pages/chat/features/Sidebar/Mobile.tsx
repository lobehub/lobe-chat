import { ActionIcon } from '@lobehub/ui';
import { Drawer } from 'antd';
import { useTheme } from 'antd-style';
import { X } from 'lucide-react';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

const Mobile = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.mobileShowTopic,
    s.toggleMobileTopic,
  ]);

  const { t } = useTranslation('common');

  return (
    <Drawer
      bodyStyle={{ padding: 0 }}
      closeIcon={<ActionIcon icon={X} size={{ blockSize: 32, fontSize: 20 }} />}
      drawerStyle={{ background: theme.colorBgContainer }}
      headerStyle={{ padding: '8px 4px' }}
      height={'75vh'}
      onClose={() => toggleConfig(false)}
      open={showAgentSettings}
      placement={'bottom'}
      title={t('topic.title')}
    >
      {children}
    </Drawer>
  );
});

export default Mobile;
