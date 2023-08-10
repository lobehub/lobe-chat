import { ActionIcon, DraggablePanelBody, EditableMessage, SearchBar } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { Maximize2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import Header from './Header';
import { Topic } from './Topic';

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    color: ${token.colorText};
  `,
  model: css`
    color: ${token.colorTextTertiary};
  `,
  prompt: css`
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 0.75;
    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  title: css`
    font-size: ${token.fontSizeHeading4}px;
    font-weight: bold;
  `,
  topic: css`
    border-top: 1px solid ${token.colorBorder};
  `,
}));

const Inner = memo(() => {
  const [openModal, setOpenModal] = useState(false);
  const { styles } = useStyles();
  const [systemRole, updateAgentConfig] = useSessionStore(
    (s) => [agentSelectors.currentAgentSystemRole(s), s.updateAgentConfig],
    shallow,
  );

  const hydrated = useSessionHydrated();
  const { t } = useTranslation('common');
  return (
    <DraggablePanelBody style={{ padding: 0 }}>
      <Header
        actions={
          <ActionIcon
            icon={Maximize2Icon}
            onClick={() => setOpenModal(true)}
            size="small"
            title={t('edit')}
          />
        }
        title={t('settingAgent.prompt.title', { ns: 'setting' })}
      />
      <Flexbox height={200} padding={'0 16px 16px'}>
        {hydrated ? (
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
        ) : (
          <Skeleton active avatar={false} style={{ marginTop: 12 }} title={false} />
        )}
      </Flexbox>
      <Flexbox className={styles.topic} gap={16} padding={16}>
        <SearchBar placeholder={t('topic.searchPlaceholder')} spotlight type={'ghost'} />
        <Topic />
      </Flexbox>
    </DraggablePanelBody>
  );
});

export default Inner;
