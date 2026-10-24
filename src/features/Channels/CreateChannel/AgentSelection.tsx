import { agentDisplayName } from '@lobechat/types';
import { ActionIcon, Button, Checkbox, Flexbox, SearchBar, Select, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { FolderOpen, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import Avatar from '@/components/Avatar';
import { DEFAULT_AVATAR } from '@/const/meta';
import AgentSelectionEmpty from '@/features/AgentSelectionEmpty';
import { openPickWorkingDirModal } from '@/features/WorkingDirectory';
import type { ChannelAgentSelection } from '@/services/channel';
import { useAgentStore } from '@/store/agent';
import { useDeviceList } from '@/store/device/useDeviceList';

const styles = stylex.create({
  picker: {
    display: 'flex',
    gap: 8,
    height: 500,
    maxHeight: '55vh',
    minHeight: 240,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: cssVar.borderRadiusLG,
  },
  pane: { flex: '1', minWidth: 0, minHeight: 0, overflowY: 'auto' },
  selected: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: cssVar.colorBorderSecondary,
    paddingInlineStart: 12,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    cursor: 'pointer',
    borderRadius: cssVar.borderRadius,
    backgroundColor: { 'default': 'transparent', ':hover': cssVar.colorFillTertiary },
  },
  extra: { paddingInlineStart: 44, paddingInlineEnd: 8, paddingBlockEnd: 12, minWidth: 0 },
  directory: { maxWidth: '100%', overflow: 'hidden' },
});

export const AgentSelection = ({
  exclude = [],
  value,
  onChange,
}: {
  /** Agents already in the Channel. */
  exclude?: string[];
  onChange: (value: ChannelAgentSelection[]) => void;
  value: ChannelAgentSelection[];
}) => {
  const { t } = useTranslation(['channel', 'device', 'chat', 'common']);
  const agentsSync = useAgentStore((s) => s.useFetchAvailableAgents)(true);
  const agents = useAgentStore((s) => s.availableAgents);
  const [search, setSearch] = useState('');
  const available = (agents ?? []).filter((agent) => !agent.isInbox && !exclude.includes(agent.id));
  const filtered = available.filter((agent) =>
    `${agentDisplayName(agent, t('unnamedAgent'))} ${agent.description ?? ''}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  const toggle = (agentId: string) =>
    onChange(
      value.some((item) => item.agentId === agentId)
        ? value.filter((item) => item.agentId !== agentId)
        : [...value, { agentId }],
    );
  const devices = useDeviceList({ refreshInterval: 15_000 });
  const change = (agentId: string, patch: Partial<ChannelAgentSelection>) =>
    onChange(value.map((item) => (item.agentId === agentId ? { ...item, ...patch } : item)));
  return (
    <Flexbox gap={12}>
      <AsyncBoundary
        data={agents}
        error={agentsSync.error}
        isLoading={!agents && !agentsSync.error}
        onRetry={() => void useAgentStore.getState().getAvailableAgents()}
      >
        <div {...stylex.props(styles.picker)}>
          <Flexbox gap={8} {...stylex.props(styles.pane)}>
            <SearchBar
              allowClear
              placeholder={t('memberSelection.searchAgents', { ns: 'chat' })}
              value={search}
              variant="filled"
              onChange={(event) => setSearch(event.target.value)}
            />
            <Flexbox {...stylex.props(styles.pane)}>
              {filtered.length ? (
                filtered.map((agent) => (
                  <label key={agent.id} {...stylex.props(styles.row)}>
                    <Checkbox
                      checked={value.some((item) => item.agentId === agent.id)}
                      onChange={() => toggle(agent.id)}
                    />
                    <Avatar
                      avatar={agent.avatar || DEFAULT_AVATAR}
                      background={agent.backgroundColor ?? undefined}
                      size={28}
                    />
                    <Text ellipsis>{agentDisplayName(agent, t('unnamedAgent'))}</Text>
                  </label>
                ))
              ) : (
                <AgentSelectionEmpty search={!!search.trim()} variant="noAvailable" />
              )}
            </Flexbox>
          </Flexbox>
          <Flexbox gap={8} {...stylex.props(styles.pane, styles.selected)}>
            <Text fontSize={12} type="secondary">
              {t('memberSelection.selectedAgents', { ns: 'chat', count: value.length })}
            </Text>
            {!value.length && <AgentSelectionEmpty variant="noSelected" />}
            <AsyncBoundary
              data={devices.data}
              error={devices.error}
              isLoading={devices.isLoading}
              onRetry={() => void devices.mutate()}
            >
              {value.map((selection) => (
                <Flexbox gap={8} key={selection.agentId}>
                  <Flexbox horizontal align="center" gap={8} padding={8}>
                    <Avatar
                      size={28}
                      avatar={
                        agents?.find((agent) => agent.id === selection.agentId)?.avatar ||
                        DEFAULT_AVATAR
                      }
                    />
                    <Text ellipsis style={{ flex: 1 }}>
                      {agentDisplayName(
                        agents?.find((agent) => agent.id === selection.agentId),
                        t('unnamedAgent'),
                      )}
                    </Text>
                    <ActionIcon
                      aria-label={t('group.removeMember', { ns: 'chat' })}
                      icon={X}
                      size="small"
                      title={t('group.removeMember', { ns: 'chat' })}
                      onClick={() => toggle(selection.agentId)}
                    />
                  </Flexbox>
                  <Flexbox gap={8} {...stylex.props(styles.extra)}>
                    <Select
                      placeholder={t('noDevice')}
                      value={selection.deviceId ?? ''}
                      options={[
                        { label: t('noDevice'), value: '' },
                        ...(devices.data ?? []).map((device) => ({
                          disabled: !devices.isConfirmed || !device.online,
                          label: `${device.friendlyName || device.hostname || device.deviceId}${device.online ? '' : ` · ${t('offline')}`}`,
                          value: device.deviceId,
                        })),
                      ]}
                      onChange={(id) => {
                        if (typeof id === 'string')
                          change(selection.agentId, {
                            deviceId: id || undefined,
                            workingDirectory: undefined,
                          });
                      }}
                    />
                    {selection.deviceId && (
                      <Button
                        icon={FolderOpen}
                        title={selection.workingDirectory || t('chooseDirectory')}
                        {...stylex.props(styles.directory)}
                        onClick={() =>
                          openPickWorkingDirModal({
                            defaultPath: selection.workingDirectory,
                            deviceId: selection.deviceId,
                            onPick: ({ path }) =>
                              change(selection.agentId, { workingDirectory: path }),
                          })
                        }
                      >
                        <Text ellipsis>{selection.workingDirectory || t('chooseDirectory')}</Text>
                      </Button>
                    )}
                  </Flexbox>
                </Flexbox>
              ))}
            </AsyncBoundary>
          </Flexbox>
        </div>
      </AsyncBoundary>
      <Text fontSize={12} type="secondary">
        {t('environmentHint')}
      </Text>
    </Flexbox>
  );
};
