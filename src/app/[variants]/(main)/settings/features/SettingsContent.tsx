'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { SettingsTabs } from '@/store/global/initialState';

const componentMap = {
  [SettingsTabs.Common]: dynamic(() => import('../common'), {
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
  // Profile related tabs
  [SettingsTabs.Profile]: dynamic(() => import('../profile'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Stats]: dynamic(() => import('../stats'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.APIKey]: dynamic(() => import('../apikey'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Security]: dynamic(() => import('../security'), {
    loading: () => <Loading />,
  }),
  [SettingsTabs.Usage]: dynamic(() => import('../usage'), {
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
    if (
      [
        SettingsTabs.About,
        SettingsTabs.Agent,
        SettingsTabs.Provider,
        SettingsTabs.Profile,
        SettingsTabs.Stats,
        SettingsTabs.Security,
        SettingsTabs.Usage,
      ].includes(tab as any)
    ) {
      componentProps.mobile = mobile;
    }

    return <Component {...componentProps} />;
  };

  if (mobile) {
    return activeTab ? renderComponent(activeTab) : renderComponent(SettingsTabs.Profile);
  }

  return (
    <Flexbox align={'center'} height={'100%'} width={'100%'}>
      {Object.keys(componentMap).map((tabKey) => {
        const isProvider = tabKey === SettingsTabs.Provider;
        if (activeTab !== tabKey) return null;
        return (
          <Flexbox
            gap={64}
            key={tabKey}
            paddingBlock={isProvider ? 0 : 24}
            paddingInline={isProvider ? 0 : 32}
            style={{
              maxWidth: isProvider ? '100%' : 1024,
              minHeight: '100%',
            }}
            width={'100%'}
          >
            {renderComponent(tabKey)}
          </Flexbox>
        );
      })}
    </Flexbox>
  );
};

export default SettingsContent;
