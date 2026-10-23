import { agentDisplayName } from '@lobechat/types';
import { Button, Flexbox, Select, Text } from '@lobehub/ui';
import { FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import { openPickWorkingDirModal } from '@/features/WorkingDirectory';
import type { ChannelAgentSelection } from '@/services/channel';
import { useAgentStore } from '@/store/agent';
import { useDeviceList } from '@/store/device/useDeviceList';

export const AgentSelection = ({
  value,
  onChange,
}: {
  onChange: (value: ChannelAgentSelection[]) => void;
  value: ChannelAgentSelection[];
}) => {
  const { t } = useTranslation(['channel', 'device']);
  const agentsSync = useAgentStore((s) => s.useFetchAvailableAgents)(true);
  const agents = useAgentStore((s) => s.availableAgents);
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
        <Select
          showSearch
          id="channel-agents"
          mode="multiple"
          placeholder={t('selectAgents')}
          value={value.map((agent) => agent.agentId)}
          options={(agents ?? [])
            .filter((agent) => !agent.isInbox)
            .map((agent) => ({
              label: agentDisplayName(agent, t('unnamedAgent')),
              value: agent.id,
            }))}
          onChange={(ids) => {
            if (Array.isArray(ids))
              onChange(
                ids.map(
                  (agentId) => value.find((agent) => agent.agentId === agentId) ?? { agentId },
                ),
              );
          }}
        />
      </AsyncBoundary>
      <Text type="secondary">{t('environmentHint')}</Text>
      <AsyncBoundary
        data={devices.data}
        error={devices.error}
        isLoading={devices.isLoading}
        onRetry={() => void devices.mutate()}
      >
        {value.map((selection) => (
          <Flexbox gap={8} key={selection.agentId}>
            <Text weight={500}>
              {agentDisplayName(
                agents?.find((agent) => agent.id === selection.agentId),
                t('unnamedAgent'),
              )}
            </Text>
            <Flexbox horizontal gap={8} wrap="wrap">
              <Select
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
                  onClick={() =>
                    openPickWorkingDirModal({
                      defaultPath: selection.workingDirectory,
                      deviceId: selection.deviceId,
                      onPick: ({ path }) => change(selection.agentId, { workingDirectory: path }),
                    })
                  }
                >
                  {selection.workingDirectory || t('chooseDirectory')}
                </Button>
              )}
            </Flexbox>
          </Flexbox>
        ))}
      </AsyncBoundary>
    </Flexbox>
  );
};
