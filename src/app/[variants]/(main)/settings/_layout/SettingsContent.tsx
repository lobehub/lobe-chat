'use client';

import dynamic from 'next/dynamic';
import React, { CSSProperties } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { SettingsTabs } from '@/store/global/initialState';

const componentMap = {
  [SettingsTabs.Common]: dynamic(() => import('../common'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Agent]: dynamic(() => import('../agent'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Provider]: dynamic(() => import('../provider'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Image]: dynamic(() => import('../image'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.TTS]: dynamic(() => import('../tts'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.About]: dynamic(() => import('../about'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Hotkey]: dynamic(() => import('../hotkey'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Proxy]: dynamic(() => import('../proxy'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Storage]: dynamic(() => import('../storage'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.SystemAgent]: dynamic(() => import('../system-agent'), {
    loading: () => <Loading />,
  }),
};

interface SettingsContentProps {
  activeTab?: string;
  mobile?: boolean;
}

const SettingsContent = ({ mobile, activeTab }: SettingsContentProps) => {
  const renderComponent = (tab: string) => {
    const Component = componentMap[tab as keyof typeof componentMap] || componentMap.common;
    if (!Component) return null;

    const componentProps: { mobile?: boolean } = {};
    if ([SettingsTabs.About, SettingsTabs.Agent, SettingsTabs.Provider].includes(tab as any)) {
      componentProps.mobile = mobile;
    }

    return <Component {...componentProps} />;
  };

  if (mobile) {
    return activeTab ? renderComponent(activeTab) : renderComponent(SettingsTabs.Common);
  }

  const getDisplayStyle = (tabName: string): CSSProperties => ({
    alignItems: 'center',
    display: activeTab === tabName ? 'flex' : 'none',
    flexDirection: 'column',
    gap: 64,
    height: '100%',
    paddingBlock:
      [SettingsTabs.Agent, SettingsTabs.Provider].includes(tabName as any) || mobile ? 0 : 24,
    paddingInline:
      [SettingsTabs.Agent, SettingsTabs.Provider].includes(tabName as any) || mobile ? 0 : 32,
    width: '100%',
  });

  return (
    <Flexbox height={'100%'} width={'100%'}>
      {Object.keys(componentMap).map((tabKey) => {
        return (
          <div key={tabKey} style={getDisplayStyle(tabKey)}>
            {activeTab === tabKey && renderComponent(tabKey)}
          </div>
        );
      })}
    </Flexbox>
  );
};

export default SettingsContent;
