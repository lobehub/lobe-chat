'use client';

import { notFound } from 'next/navigation';
import React, { CSSProperties, Suspense, lazy } from 'react';
import { Flexbox } from 'react-layout-kit';

import SkeletonLoading from '@/components/Loading/SkeletonLoading';
import { SettingsTabs } from '@/store/global/initialState';

import Agent from '../agent/index';
import Common from '../common';
import LLM from '../llm/index';
import Provider from '../provider/index';

// Lazy load components
const About = lazy(() => import('../about/index'));
const Hotkey = lazy(() => import('../hotkey/index'));
const Proxy = lazy(() => import('../proxy/index'));
const Storage = lazy(() => import('../storage/index'));
const SystemAgent = lazy(() => import('../system-agent/index'));
const TTS = lazy(() => import('../tts/index'));

interface SettingsContentProps {
  activeTab?: string;
  mobile?: boolean;
  showLLM?: boolean;
}

const SettingsContent = ({ mobile, activeTab, showLLM = true }: SettingsContentProps) => {
  const getDisplayStyle = (tabName: string) =>
    ({
      alignItems: 'center',
      display: activeTab === tabName ? 'flex' : 'none',
      flexDirection: 'column',
      height: '100%',
      paddingBlock:
        tabName === SettingsTabs.Agent || tabName === SettingsTabs.Provider || mobile ? 0 : 24,
      paddingInline:
        tabName === SettingsTabs.Agent || tabName === SettingsTabs.Provider || mobile ? 0 : 32,
      width: '100%',
    }) as CSSProperties;

  const LazyWrapper = ({
    children,
    isActive,
  }: {
    children: React.ReactNode;
    isActive: boolean;
  }) => {
    if (!isActive) return null;
    return <Suspense fallback={<SkeletonLoading />}>{children}</Suspense>;
  };

  if (mobile) {
    switch (activeTab) {
      case SettingsTabs.Common: {
        return <Common />;
      }
      case SettingsTabs.About: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <About mobile={mobile} />
          </Suspense>
        );
      }
      case SettingsTabs.Agent: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <Agent mobile={mobile} />
          </Suspense>
        );
      }
      case SettingsTabs.Hotkey: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <Hotkey />
          </Suspense>
        );
      }
      case SettingsTabs.LLM: {
        if (!showLLM) {
          notFound();
        }
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <LLM />
          </Suspense>
        );
      }
      case SettingsTabs.Provider: {
        if (!showLLM) {
          notFound();
        }
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <Provider mobile={mobile} />
          </Suspense>
        );
      }
      case SettingsTabs.Proxy: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <Proxy />
          </Suspense>
        );
      }
      case SettingsTabs.Storage: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <Storage />
          </Suspense>
        );
      }
      case SettingsTabs.SystemAgent: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <SystemAgent />
          </Suspense>
        );
      }
      case SettingsTabs.TTS: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <TTS />
          </Suspense>
        );
      }
      default: {
        return (
          <Suspense fallback={<SkeletonLoading />}>
            <Common />
          </Suspense>
        );
      }
    }
  }

  // Desktop use Lazy Load
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <div style={getDisplayStyle(SettingsTabs.Common)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.Common}>
          <Common />
        </LazyWrapper>
      </div>

      <div style={getDisplayStyle(SettingsTabs.About)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.About}>
          <About mobile={mobile} />
        </LazyWrapper>
      </div>

      {showLLM ? (
        <div style={getDisplayStyle(SettingsTabs.Agent)}>
          <Agent mobile={mobile} />
        </div>
      ) : (
        activeTab === SettingsTabs.Agent && notFound()
      )}

      <div style={getDisplayStyle(SettingsTabs.Hotkey)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.Hotkey}>
          <Hotkey />
        </LazyWrapper>
      </div>

      <div style={getDisplayStyle(SettingsTabs.LLM)}>
        <LLM />
      </div>

      {showLLM ? (
        <div style={getDisplayStyle(SettingsTabs.Provider)}>
          <Provider mobile={mobile} />
        </div>
      ) : (
        activeTab === SettingsTabs.Provider && notFound()
      )}

      <div style={getDisplayStyle(SettingsTabs.Proxy)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.Proxy}>
          <Proxy />
        </LazyWrapper>
      </div>

      <div style={getDisplayStyle(SettingsTabs.Storage)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.Storage}>
          <Storage />
        </LazyWrapper>
      </div>

      <div style={getDisplayStyle(SettingsTabs.SystemAgent)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.SystemAgent}>
          <SystemAgent />
        </LazyWrapper>
      </div>

      <div style={getDisplayStyle(SettingsTabs.TTS)}>
        <LazyWrapper isActive={activeTab === SettingsTabs.TTS}>
          <TTS />
        </LazyWrapper>
      </div>
    </Flexbox>
  );
};

export default SettingsContent;
