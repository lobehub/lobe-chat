import { ActionIcon, DraggablePanelBody, EditableMessage, SearchBar } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Maximize2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { Topic } from '@/pages/chat/[id]/Config/Topic';
import { agentSelectors, useSessionStore } from '@/store/session';

import Header from './Header';

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

    height: 200px;
    padding: 0 16px 16px;

    opacity: 0.75;
    border-bottom: 1px solid ${token.colorBorder};

    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
  title: css`
    font-size: ${token.fontSizeHeading4}px;
    font-weight: bold;
  `,
}));

const SideBar = memo(() => {
  const [openModal, setOpenModal] = useState(false);
  const { styles } = useStyles();
  const [systemRole, updateAgentConfig] = useSessionStore(
    (s) => [agentSelectors.currentAgentSystemRole(s), s.updateAgentConfig],
    shallow,
  );

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
      <Flexbox gap={16} style={{ padding: 16 }}>
        <SearchBar placeholder={t('topic.searchPlaceholder')} spotlight type={'ghost'} />
        <Topic />
      </Flexbox>
    </DraggablePanelBody>
  );
});

export default SideBar;
