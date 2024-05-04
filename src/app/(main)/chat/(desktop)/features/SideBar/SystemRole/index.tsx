import { ActionIcon, EditableMessage } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { Edit } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

import SidebarHeader from '@/components/SidebarHeader';
import AgentInfo from '@/features/AgentInfo';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import { useStyles } from './style';

const SystemRole = memo(() => {
  const [editing, setEditing] = useState(false);
  const { styles } = useStyles();
  const openChatSettings = useOpenChatSettings(ChatSettingsTabs.Prompt);
  const [init, meta] = useSessionStore((s) => [
    sessionSelectors.isSomeSessionActive(s),
    sessionMetaSelectors.currentAgentMeta(s),
  ]);

  const [systemRole, updateAgentConfig] = useAgentStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
    s.updateAgentConfig,
  ]);

  const [showSystemRole, toggleSystemRole] = useGlobalStore((s) => [
    s.preference.showSystemRole,
    s.toggleSystemRole,
  ]);

  const [open, setOpen] = useMergeState(false, {
    defaultValue: showSystemRole,
    onChange: toggleSystemRole,
    value: showSystemRole,
  });

  const { t } = useTranslation('common');

  const handleOpenWithEdit = () => {
    if (!init) return;
    setEditing(true);
    setOpen(true);
  };

  const handleOpen = () => {
    if (!init) return;

    setOpen(true);
  };

  return (
    <Flexbox height={'fit-content'}>
      <SidebarHeader
        actions={
          <ActionIcon icon={Edit} onClick={handleOpenWithEdit} size={'small'} title={t('edit')} />
        }
        title={t('settingAgent.prompt.title', { ns: 'setting' })}
      />
      <Flexbox
        className={styles.promptBox}
        height={200}
        onClick={handleOpen}
        onDoubleClick={(e) => {
          if (e.altKey) handleOpenWithEdit();
        }}
      >
        {!init ? (
          <Skeleton
            active
            avatar={false}
            style={{ marginTop: 12, paddingInline: 16 }}
            title={false}
          />
        ) : (
          <>
            <EditableMessage
              classNames={{ markdown: styles.prompt }}
              editing={editing}
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
              styles={{ markdown: systemRole ? {} : { opacity: 0.5 } }}
              text={{
                cancel: t('cancel'),
                confirm: t('ok'),
                edit: t('edit'),
                title: t('settingAgent.prompt.title', { ns: 'setting' }),
              }}
              value={systemRole}
            />
            <div className={styles.promptMask} />
          </>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default SystemRole;
