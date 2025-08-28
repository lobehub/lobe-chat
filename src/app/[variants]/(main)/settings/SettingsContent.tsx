'use client';

import { useMemo, useState } from 'react';

import { SettingsTabs } from '@/store/global/initialState';

import About from './about/index';
import Agent from './agent/index';
import Common from './common/index';
import Hotkey from './hotkey/page';
import LLM from './llm/index';
import Provider from './provider/page';
import Proxy from './proxy/index';
import Storage from './storage/page';
import Sync from './sync/index';
import SystemAgent from './system-agent/index';
import TTS from './tts/index';

interface SettingsContentProps {
  mobile?: boolean;
}

const SettingsContent = ({ mobile }: SettingsContentProps) => {
  const [activeTab, _setActiveTab] = useState(SettingsTabs.Common);

  const ContentPage = useMemo(() => {
    switch (activeTab) {
      case SettingsTabs.About: {
        return <About mobile={mobile} />;
      }
      case SettingsTabs.Agent: {
        return <Agent />;
      }
      case SettingsTabs.Common: {
        return <Common />;
      }
      case SettingsTabs.Hotkey: {
        return <Hotkey />;
      }
      case SettingsTabs.LLM: {
        return <LLM />;
      }
      case SettingsTabs.Provider: {
        return <Provider />;
      }
      case SettingsTabs.Proxy: {
        return <Proxy />;
      }
      case SettingsTabs.Storage: {
        return <Storage />;
      }
      case SettingsTabs.Sync: {
        return <Sync mobile={mobile} />;
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
  }, [mobile, activeTab]);

  return ContentPage;
};

export default SettingsContent;