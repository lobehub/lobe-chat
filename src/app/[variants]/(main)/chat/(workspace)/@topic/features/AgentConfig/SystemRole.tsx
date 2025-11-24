'use client';

import { EditableMessage } from '@lobehub/ui/chat';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { MouseEvent, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import AgentInfo from '@/features/AgentInfo';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

export const useStyles = createStyles(({ css, token }) => ({
  prompt: css`
    opacity: 0.75;
    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
}));

interface SystemRoleProps {
  editing: boolean;
  isLoading: boolean;
  open: boolean;
  setEditing: (value: boolean) => void;
  setOpen: (value: boolean) => void;
}

const SystemRole = memo(({ editing, setEditing, open, setOpen, isLoading }: SystemRoleProps) => {
  const { styles } = useStyles();
  const openChatSettings = useOpenChatSettings(ChatSettingsTabs.Prompt);
  const { t } = useTranslation('common');

  const [meta] = useSessionStore((s) => [sessionMetaSelectors.currentAgentMeta(s)]);

  const [systemRole, updateAgentConfig] = useAgentStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
    s.updateAgentConfig,
  ]);

  const handleOpenWithEdit = (e: MouseEvent) => {
    if (isLoading) return;
    e.stopPropagation();
    setEditing(true);
    setOpen(true);
  };

  const handleOpen = (e: MouseEvent) => {
    if (isLoading) return;
    if (e.altKey) handleOpenWithEdit(e);
    setOpen(true);
  };

  if (isLoading)
    return (
      <Flexbox padding={16}>
        <Skeleton active avatar={false} title={false} />
      </Flexbox>
    );

  return (
    <Flexbox height={200} onClick={handleOpen} padding={16}>
      <EditableMessage
        classNames={{ markdown: styles.prompt }}
        editing={editing}
        markdownProps={{ enableLatex: false, enableMermaid: false }}
        model={{
          extra: (
            <AgentInfo
              meta={meta}
              onAvatarClick={() => {
                setOpen(false);
                setEditing(false);
                openChatSettings();
              }}
              style={{ marginBottom: 16 }}
            />
          ),
        }}
        onChange={(e) => {
          updateAgentConfig({ systemRole: e });
        }}
        onEditingChange={setEditing}
        onOpenChange={setOpen}
        openModal={open}
        placeholder={`${t('settingAgent.prompt.placeholder', { ns: 'setting' })}...`}
        styles={{ markdown: { opacity: systemRole ? undefined : 0.5, overflow: 'visible' } }}
        text={{
          cancel: t('cancel'),
          confirm: t('ok'),
          edit: t('edit'),
          title: t('settingAgent.prompt.title', { ns: 'setting' }),
        }}
        value={systemRole}
      />
    </Flexbox>
  );
});

SystemRole.displayName = 'SystemRole';

export default SystemRole;
