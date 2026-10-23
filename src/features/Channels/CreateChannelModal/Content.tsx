import { Button, Flexbox, Input, useModalContext } from '@lobehub/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import type { ChannelAgentSelection } from '@/services/channel';
import { channelActions } from '@/store/channel';

import { AgentSelection } from './AgentSelection';

export const Content = ({ onCreated }: { onCreated: (id: string) => void }) => {
  const { t } = useTranslation('channel');
  const { close, setCanDismissByClickOutside } = useModalContext();
  const [title, setTitle] = useState('');
  const [agents, setAgents] = useState<ChannelAgentSelection[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const submit = async () => {
    if (busy || !title.trim() || !agents.length) return;
    setBusy(true);
    setCanDismissByClickOutside(false);
    setError(undefined);
    try {
      const id = await channelActions.create({ agents, title: title.trim() });
      close();
      onCreated(id);
    } catch (cause) {
      console.error('Failed to create Channel', cause);
      setError(cause);
    } finally {
      setBusy(false);
      setCanDismissByClickOutside(true);
    }
  };
  return (
    <Flexbox gap={20}>
      <Flexbox gap={8}>
        <label htmlFor="channel-title">{t('name')}</label>
        <Input
          autoFocus
          id="channel-title"
          maxLength={100}
          readOnly={busy}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Flexbox>
      <Flexbox gap={8} inert={busy}>
        <label htmlFor="channel-agents">{t('agents')}</label>
        <AgentSelection value={agents} onChange={setAgents} />
      </Flexbox>
      {error !== undefined && <AsyncError error={error} variant="inline" />}
      <Flexbox horizontal gap={8} justify="flex-end">
        <Button disabled={busy} onClick={close}>
          {t('cancel')}
        </Button>
        <Button
          loading={busy}
          type="primary"
          disabled={
            !title.trim() ||
            !agents.length ||
            agents.some((agent) => agent.deviceId && !agent.workingDirectory)
          }
          onClick={() => void submit()}
        >
          {t('create')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
};
