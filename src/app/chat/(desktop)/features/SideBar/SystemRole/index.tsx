import { ActionIcon, EditableMessage } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

import AgentInfo from '@/features/AgentInfo';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';
import { pathString } from '@/utils/url';

import SidebarHeader from '../../../../components/SidebarHeader';
import { useStyles } from './style';

const SystemRole = memo(() => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { styles } = useStyles();

  const [init, systemRole, meta, updateAgentConfig] = useSessionStore((s) => [
    sessionSelectors.isSomeSessionActive(s),
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentMeta(s),
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
                      router.push(pathString('/chat/settings', { hash: location.hash }));
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
