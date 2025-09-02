'use client';

import { notFound } from 'next/navigation';
import { CSSProperties } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SettingsTabs } from '@/store/global/initialState';

import About from '../about/index';
import Agent from '../agent/index';
import Common from '../common';
import Hotkey from '../hotkey/index';
import LLM from '../llm/index';
import Provider from '../provider/index';
import Proxy from '../proxy/index';
import Storage from '../storage/index';
import SystemAgent from '../system-agent/index';
import TTS from '../tts/index';

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

  if (mobile) {
    switch (activeTab) {
      case SettingsTabs.Common: {
        return <Common />;
      }
      case SettingsTabs.About: {
        return <About mobile={mobile} />;
      }
      case SettingsTabs.Agent: {
        return <Agent mobile={mobile} />;
      }
      case SettingsTabs.Hotkey: {
        return <Hotkey />;
      }
      case SettingsTabs.LLM: {
        if (!showLLM) {
          notFound();
        } else {
          return <LLM />;
        }
        break;
      }
      case SettingsTabs.Provider: {
        if (!showLLM) {
          notFound();
        } else {
          return <Provider mobile={mobile} />;
        }
        break;
      }
      case SettingsTabs.Proxy: {
        return <Proxy />;
      }
      case SettingsTabs.Storage: {
        return <Storage />;
      }
      case SettingsTabs.SystemAgent: {
        return <SystemAgent />;
      }
      case SettingsTabs.TTS: {
        return <TTS />;
      }
      default: {
        return <Common />;
      }
    }
  }

  // Desktop use Load All
  return (
    <Flexbox height={'100%'} width={'100%'}>
      <div style={getDisplayStyle(SettingsTabs.Common)}>
        <Common />
      </div>

      <div style={getDisplayStyle(SettingsTabs.About)}>
        <About mobile={mobile} />
      </div>

      {showLLM ? (
        <div style={getDisplayStyle(SettingsTabs.Agent)}>
          <Agent mobile={mobile} />
        </div>
      ) : (
        notFound()
      )}

      <div style={getDisplayStyle(SettingsTabs.Hotkey)}>
        <Hotkey />
      </div>

      <div style={getDisplayStyle(SettingsTabs.LLM)}>
        <LLM />
      </div>

      {showLLM ? (
        <div style={getDisplayStyle(SettingsTabs.Provider)}>
          <Provider mobile={mobile} />
        </div>
      ) : (
        notFound()
      )}

      <div style={getDisplayStyle(SettingsTabs.Proxy)}>
        <Proxy />
      </div>

      <div style={getDisplayStyle(SettingsTabs.Storage)}>
        <Storage />
      </div>

      <div style={getDisplayStyle(SettingsTabs.SystemAgent)}>
        <SystemAgent />
      </div>

      <div style={getDisplayStyle(SettingsTabs.TTS)}>
        <TTS />
      </div>
    </Flexbox>
  );
};

export default SettingsContent;
