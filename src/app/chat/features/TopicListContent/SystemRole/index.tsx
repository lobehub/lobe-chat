import { ActionIcon, EditableMessage } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { Edit } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import AgentInfo from '@/features/AgentInfo';
import { useSessionChatInit, useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import Header from './Header';
import { useStyles } from './style';

const SystemRole = memo(() => {
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const { styles } = useStyles();
  const [systemRole, meta, updateAgentConfig] = useSessionStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
    agentSelectors.currentAgentMeta(s),
    s.updateAgentConfig,
  ]);

  const init = useSessionChatInit();
  const { t } = useTranslation('common');
  return (
    <Flexbox height={'fit-content'}>
      <Header
        actions={
          <ActionIcon
            icon={Edit}
            onClick={() => setOpenModal(true)}
            size={'small'}
            title={t('edit')}
          />
        }
        title={t('settingAgent.prompt.title', { ns: 'setting' })}
      />
      <Flexbox
        className={styles.promptBox}
        height={200}
        onDoubleClick={(e) => {
          if (e.altKey) {
            setOpenModal(true);
            setEditing(true);
          }
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
              model={{ extra: <AgentInfo meta={meta} style={{ marginBottom: 16 }} /> }}
              onChange={(e) => {
                updateAgentConfig({ systemRole: e });
              }}
              onEditingChange={setEditing}
              onOpenChange={setOpenModal}
              openModal={openModal}
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
