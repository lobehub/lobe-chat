'use client';

import { createStyles, css, cx } from 'antd-style';
import { CSSProperties } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LayoutSettingsFooterClassName } from '@/features/Setting/Footer';
import { SettingsTabs } from '@/store/global/initialState';

import About from '../about/index';
import Agent from '../agent/index';
import CommonForm from '../common';
import Hotkey from '../hotkey/page';
import LLM from '../llm/index';
import Provider from '../provider/page';
import Proxy from '../proxy/index';
import Storage from '../storage/page';
import Sync from '../sync/index';
import SystemAgent from '../system-agent/index';
import TTS from '../tts/index';

interface SettingsContentProps {
  actions: any;
  activeTab?: string;
  mobile?: boolean;
  state: any;
}

const useStyles = createStyles(() => ({
  agentLayout: css`
    .${LayoutSettingsFooterClassName} {
      display: none;
    }
  `,
}));

const SettingsContent = ({ mobile, activeTab, state, actions }: SettingsContentProps) => {
  const getDisplayStyle = (tabName: string) =>
    ({
      alignItems: 'center',
      // display: activeTab === tabName ? 'block' : 'none',
      display: activeTab === tabName ? 'flex' : 'none',
      flexDirection: 'column',
      height: '100%',
      paddingBlock:
        tabName === SettingsTabs.Agent || tabName === SettingsTabs.Provider || mobile ? 0 : 24,
      paddingInline:
        tabName === SettingsTabs.Agent || tabName === SettingsTabs.Provider || mobile ? 0 : 32,
      width: '100%',
    }) as CSSProperties;

  const { styles } = useStyles();

  return (
    <Flexbox height={'100%'} width={'100%'}>
      <div style={getDisplayStyle(SettingsTabs.Common)}>
        <CommonForm {...state.common} {...actions.common} mobile={mobile} />
      </div>

      <div style={getDisplayStyle(SettingsTabs.About)}>
        <About mobile={mobile} />
      </div>

      <div className={cx(styles.agentLayout)} style={getDisplayStyle(SettingsTabs.Agent)}>
        <Agent mobile={mobile} />
      </div>

      <div style={getDisplayStyle(SettingsTabs.Hotkey)}>
        <Hotkey />
      </div>

      <div style={getDisplayStyle(SettingsTabs.LLM)}>
        <LLM />
      </div>

      <div style={getDisplayStyle(SettingsTabs.Provider)}>
        <Provider />
      </div>

      <div style={getDisplayStyle(SettingsTabs.Proxy)}>
        <Proxy />
      </div>

      <div style={getDisplayStyle(SettingsTabs.Storage)}>
        <Storage />
      </div>

      <div style={getDisplayStyle(SettingsTabs.Sync)}>
        <Sync mobile={mobile} />
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
