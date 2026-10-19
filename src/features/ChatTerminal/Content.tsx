'use client';

import { isDesktop } from '@lobechat/const';
import {
  ActionIcon,
  Button,
  type ContextMenuItem,
  ContextMenuTrigger,
  createStaticStyles,
  Flexbox,
  Select,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTab,
  Text,
} from '@lobehub/ui';
import {
  CopyXIcon,
  PlusIcon,
  SquareSplitHorizontalIcon,
  SquareTerminalIcon,
  XIcon,
} from 'lucide-react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveExecutionTarget } from '@/helpers/executionTarget';
import { useIsGatewayModeEnabled } from '@/helpers/gatewayMode';
import { useEffectiveAgencyConfig } from '@/hooks/useEffectiveAgencyConfig';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { canHostTerminal, deviceSelectors, useDeviceStore } from '@/store/device';
import { useElectronStore } from '@/store/electron';
import { useGlobalStore } from '@/store/global';

import SplitView from './SplitView';
import type { TerminalTab } from './store';
import { useChatTerminalStore } from './store';
import { buildTargetOptions, LOCAL_TARGET, resolveTerminalDevice } from './targetOptions';

const EMPTY_TABS: TerminalTab[] = [];

const styles = createStaticStyles(({ css, cssVar }) => ({
  container: css`
    overflow: hidden;
    height: 100%;
    background: ${cssVar.colorBgContainer};
  `,
  indicator: css`
    && {
      border-radius: ${cssVar.borderRadius};
      background: ${cssVar.colorFillSecondary};
      box-shadow: none;
    }
  `,
  tab: css`
    && {
      gap: 4px;
      height: 24px;
      padding-inline: 8px 4px;
      font-weight: normal;
    }

    &&[data-active] {
      color: ${cssVar.colorText};
    }
  `,
  tabBar: css`
    flex: none;
    padding-block: 4px;
    padding-inline: 8px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  tabList: css`
    && {
      gap: 4px;
      padding: 0;
      border-radius: 0;
      background: none;
    }
  `,
  tabs: css`
    width: auto;
  `,
  view: css`
    overflow: hidden;
    flex: 1;

    min-height: 0;
    padding-block: 4px 8px;
    padding-inline: 12px;
  `,
}));

const Content = memo(() => {
  const { t } = useTranslation('chat');

  const topicId = useChatStore((s) => s.activeTopicId);
  const agentId = useChatStore((s) => s.activeAgentId);
  const topicWorkingDirectory = useChatStore(topicSelectors.currentTopicWorkingDirectory);
  const currentDeviceId = useElectronStore((s) => s.gatewayDeviceInfo?.deviceId);
  const toggleTerminalPanel = useGlobalStore((s) => s.toggleTerminalPanel);

  // The device the conversation runs on — the same resolution the chat input's
  // device picker shows, so the terminal opens next to the agent's files.
  const { agencyConfig, workspaceScoped } = useEffectiveAgencyConfig(agentId || undefined);
  const deviceRoutingAvailable = useIsGatewayModeEnabled(agentId || undefined);
  const executionTarget = resolveExecutionTarget(agencyConfig, {
    clientExecutionAvailable: isDesktop,
    deviceRoutingAvailable,
    isHetero: !!agencyConfig?.heterogeneousProvider?.type,
    workspaceScoped,
  });
  const boundDeviceId = executionTarget === 'device' ? agencyConfig?.boundDeviceId : undefined;
  // Bound to this very desktop: its own PTY is the same machine, minus a gateway hop.
  const topicDeviceId = isDesktop && boundDeviceId === currentDeviceId ? undefined : boundDeviceId;

  // Tabs are bound to the topic: sessions created here only show for this topic.
  const topicKey = topicId || (agentId ? `agent:${agentId}` : 'global');

  const tabs = useChatTerminalStore((s) => s.tabsByTopic[topicKey]) ?? EMPTY_TABS;
  const activeTabId = useChatTerminalStore((s) => s.activeTabIds[topicKey]);
  const creating = useChatTerminalStore((s) => !!s.creatingByTopic[topicKey]);
  const createError = useChatTerminalStore((s) => s.createErrors[topicKey]);
  const createTab = useChatTerminalStore((s) => s.createTab);
  const closeTab = useChatTerminalStore((s) => s.closeTab);
  const closeOtherTabs = useChatTerminalStore((s) => s.closeOtherTabs);
  const setActiveTab = useChatTerminalStore((s) => s.setActiveTab);
  const splitPane = useChatTerminalStore((s) => s.splitPane);
  const closePane = useChatTerminalStore((s) => s.closePane);
  const setActivePane = useChatTerminalStore((s) => s.setActivePane);
  const setPaneFlex = useChatTerminalStore((s) => s.setPaneFlex);
  const devicePick = useChatTerminalStore((s) => s.devicePickByTopic[topicKey]);
  const setTerminalDevice = useChatTerminalStore((s) => s.setTerminalDevice);

  // The panel shell only fetches the list on the web; desktop needs it here to
  // follow a topic bound to a remote device.
  useDeviceStore((s) => s.useFetchDevices)(true);
  const devices = useDeviceStore(deviceSelectors.deviceList);
  const deviceListLoaded = useDeviceStore(deviceSelectors.isDeviceListLoaded);
  // Only devices that can actually open a shell. An offline row, or one whose
  // live connections are all desktop ones, answers a terminal RPC with a
  // refusal — offering it would fail the session the moment it is claimed.
  const targets = useMemo(() => devices.filter(canHostTerminal), [devices]);
  const { deviceId: targetDeviceId, ready: canSpawn } = resolveTerminalDevice({
    listLoaded: deviceListLoaded,
    localAvailable: isDesktop,
    pick: devicePick,
    targets,
    topicDeviceId,
  });

  const agentWorkingDirectory = useAgentStore((s) =>
    agentId
      ? agentByIdSelectors.getAgentWorkingDirectoryById(
          agentId,
          targetDeviceId ?? currentDeviceId,
        )(s)
      : undefined,
  );
  const cwd = topicWorkingDirectory || agentWorkingDirectory || undefined;

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs.at(-1);

  const prevTabCountRef = useRef(0);

  // Open a first shell automatically when this topic has none yet and we know
  // where it would run. Runs on open / topic switch / target arrival only — NOT
  // on tab-count changes, so closing the last tab doesn't respawn a shell.
  useEffect(() => {
    prevTabCountRef.current = tabs.length;
    if (tabs.length === 0 && canSpawn) void createTab(topicKey, cwd, targetDeviceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicKey, canSpawn]);

  // Closing the last tab (X button or the shell exiting) collapses the panel.
  useEffect(() => {
    if (tabs.length === 0 && prevTabCountRef.current > 0) toggleTerminalPanel(false);
    prevTabCountRef.current = tabs.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  const tabMenuItems = (tabId: string): ContextMenuItem[] => [
    {
      icon: XIcon,
      key: 'close',
      label: t('terminalPanel.closeTab'),
      onClick: () => closeTab(topicKey, tabId),
    },
    {
      disabled: tabs.length <= 1,
      icon: CopyXIcon,
      key: 'closeOthers',
      label: t('terminalPanel.closeOtherTabs'),
      onClick: () => closeOtherTabs(topicKey, tabId),
    },
  ];

  /**
   * Point the topic at another machine. Existing shells keep running where they
   * started, so open one — otherwise picking a device looks like it did nothing.
   */
  const selectTarget = (next: string) => {
    const deviceId = next === LOCAL_TARGET ? undefined : next;
    setTerminalDevice(topicKey, deviceId);
    void createTab(topicKey, cwd, deviceId);
  };

  const targetOptions = buildTargetOptions(
    targets,
    isDesktop ? t('terminalPanel.targetLocal') : undefined,
  );

  return (
    <Flexbox className={styles.container}>
      <Flexbox horizontal align={'center'} className={styles.tabBar} gap={4}>
        <TabsRoot
          className={styles.tabs}
          size={'small'}
          value={activeTab?.id ?? null}
          onValueChange={(next) => {
            if (typeof next === 'string') setActiveTab(topicKey, next);
          }}
        >
          <TabsList className={styles.tabList}>
            <TabsIndicator className={styles.indicator} />
            {tabs.map((tab) => (
              <ContextMenuTrigger items={() => tabMenuItems(tab.id)} key={tab.id}>
                <TabsTab className={styles.tab} value={tab.id}>
                  <SquareTerminalIcon size={12} />
                  {tab.title}
                  <ActionIcon
                    icon={XIcon}
                    size={{ blockSize: 20, size: 12 }}
                    title={t('terminalPanel.closeTab')}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(topicKey, tab.id);
                    }}
                  />
                </TabsTab>
              </ContextMenuTrigger>
            ))}
          </TabsList>
        </TabsRoot>
        <ActionIcon
          icon={PlusIcon}
          loading={creating}
          size={'small'}
          title={t('terminalPanel.newTab')}
          onClick={() => createTab(topicKey, cwd, targetDeviceId)}
        />
        <Flexbox flex={1} />
        <Select
          options={targetOptions}
          size={'small'}
          // The trigger defaults to `width: 100%`, which fills the whole tab bar.
          style={{ flex: 'none', maxWidth: 240, minWidth: 120, width: 'auto' }}
          value={targetDeviceId ?? LOCAL_TARGET}
          onChange={(value) => selectTarget(String(value))}
        />
        <ActionIcon
          disabled={!activeTab || creating}
          icon={SquareSplitHorizontalIcon}
          size={'small'}
          title={t('terminalPanel.split')}
          onClick={() => activeTab && splitPane(topicKey, activeTab.id, cwd, targetDeviceId)}
        />
        <ActionIcon
          icon={XIcon}
          size={'small'}
          title={t('terminalPanel.close')}
          onClick={() => toggleTerminalPanel(false)}
        />
      </Flexbox>
      <div className={styles.view}>
        {activeTab ? (
          <SplitView
            activePaneId={activeTab.activePaneId}
            panes={activeTab.panes}
            onActivatePane={(paneId) => setActivePane(topicKey, activeTab.id, paneId)}
            onClosePane={(paneId) => closePane(topicKey, paneId)}
            onResize={(flex) => setPaneFlex(topicKey, activeTab.id, flex)}
          />
        ) : createError ? (
          <Flexbox align={'center'} flex={1} gap={8} height={'100%'} justify={'center'}>
            <Text type={'secondary'}>{t('terminalPanel.createFailed')}</Text>
            <Button onClick={() => createTab(topicKey, cwd, targetDeviceId)}>
              {t('retry', { ns: 'common' })}
            </Button>
          </Flexbox>
        ) : null}
      </div>
    </Flexbox>
  );
});

export default Content;
