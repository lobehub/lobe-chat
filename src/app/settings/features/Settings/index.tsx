import { TabsNav } from '@lobehub/ui';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';

import Banner from '../Banner';
import Agent from './Agent';
import Common from './Common';
import LLM from './LLM';

const Settings = memo(() => {
  const { t } = useTranslation('setting');

  const [tab, setTab] = useGlobalStore((s) => [s.settingsTab, s.switchSettingTabs]);

  const content = useMemo(() => {
    switch (tab) {
      case 'llm': {
        return <LLM />;
      }
      case 'agent': {
        return <Agent />;
      }
      default:
      case 'common': {
        return <Common />;
      }
    }
  }, [tab]);

  return (
    <Center gap={16} width={'100%'}>
      <Banner
        nav={
          <TabsNav
            activeKey={tab}
            items={[
              { key: 'common', label: t('tab.common') },
              { key: 'llm', label: t('tab.llm') },
              { key: 'agent', label: t('tab.agent') },
            ]}
            onChange={(e) => setTab(e as any)}
          />
        }
      />
      {content}
    </Center>
  );
});

export default Settings;
