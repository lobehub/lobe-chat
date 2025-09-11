'use client';

import { css, cx } from 'antd-style';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import React, { CSSProperties } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonLoading from '@/components/Loading/SkeletonLoading';
import { SettingsTabs } from '@/store/global/initialState';

const HavePaddingLoadingClassName = cx(css`
  padding: 24px;
`);

const componentMap = {
  [SettingsTabs.Common]: dynamic(() => import('../common'), {
    loading: () => <SkeletonLoading />,
    ssr: false,
  }),
  [SettingsTabs.Agent]: dynamic(() => import('../agent'), {
    loading: () => <SkeletonLoading className={HavePaddingLoadingClassName} />,
    ssr: false,
  }),
  [SettingsTabs.LLM]: dynamic(() => import('../llm'), {
    loading: () => <SkeletonLoading />,
    ssr: false,
  }),
  [SettingsTabs.Provider]: dynamic(() => import('../provider'), {
    loading: () => <SkeletonLoading className={HavePaddingLoadingClassName} />,
    ssr: false,
  }),
  [SettingsTabs.TTS]: dynamic(() => import('../tts'), {
    loading: () => <SkeletonLoading />,
  }),
  [SettingsTabs.About]: dynamic(() => import('../about'), {
    loading: () => <SkeletonLoading />,
  }),
  [SettingsTabs.Hotkey]: dynamic(() => import('../hotkey'), {
    loading: () => <SkeletonLoading />,
  }),
  [SettingsTabs.Proxy]: dynamic(() => import('../proxy'), {
    loading: () => <SkeletonLoading />,
  }),
  [SettingsTabs.Storage]: dynamic(() => import('../storage'), {
    loading: () => <SkeletonLoading />,
  }),
  [SettingsTabs.SystemAgent]: dynamic(() => import('../system-agent'), {
    loading: () => <SkeletonLoading />,
  }),
};

interface SettingsContentProps {
  activeTab?: string;
  mobile?: boolean;
  showLLM?: boolean;
}

const SettingsContent = ({ mobile, activeTab, showLLM = true }: SettingsContentProps) => {
  const shouldRenderLLMTabs = (tab: string) => {
    const isLLMTab =
      tab === SettingsTabs.LLM || tab === SettingsTabs.Provider || tab === SettingsTabs.Agent;
    return showLLM || !isLLMTab;
  };
  if (activeTab && !shouldRenderLLMTabs(activeTab)) {
    notFound();
  }
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
        if (!shouldRenderLLMTabs(tabKey)) return null;
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
