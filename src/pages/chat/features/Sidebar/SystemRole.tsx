import { ActionIcon, EditableMessage } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { Edit } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Header from '@/pages/chat/features/Sidebar/Header';
import { agentSelectors, useSessionChatInit, useSessionStore } from '@/store/session';

const useStyles = createStyles(({ css, token }) => ({
  prompt: css`
    overflow-x: hidden;
    overflow-y: auto;

    padding: 0 16px 16px;

    opacity: 0.75;

    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  promptBox: css`
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid ${token.colorBorder};
  `,
  promptMask: css`
    pointer-events: none;

    position: absolute;
    z-index: 10;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 32px;

    background: linear-gradient(to bottom, transparent, ${token.colorBgLayout});
  `,
}));

const SystemRole = memo(() => {
  const [openModal, setOpenModal] = useState(false);

  const { styles } = useStyles();
  const [systemRole, updateAgentConfig] = useSessionStore((s) => [
    agentSelectors.currentAgentSystemRole(s),
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
            size="small"
            title={t('edit')}
          />
        }
        title={t('settingAgent.prompt.title', { ns: 'setting' })}
      />
      <Flexbox className={styles.promptBox} height={200}>
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
              onChange={(e) => {
                updateAgentConfig({ systemRole: e });
              }}
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
