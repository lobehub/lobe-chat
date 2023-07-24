import { ActionIcon, Avatar, ChatHeader } from '@lobehub/ui';
import { Tag } from 'antd';
import { PanelRightClose, PanelRightOpen, Settings, Share2 } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import HeaderTitle from '@/components/HeaderTitle';
import { agentSelectors, useSessionStore } from '@/store/session';

const Header = memo(() => {
  const { t } = useTranslation('common');

  const [meta, id, modle] = useSessionStore(
    (s) => [agentSelectors.currentAgentMeta(s), s.activeId, agentSelectors.currentAgentModel(s)],
    shallow,
  );
  const [showAgentSettings, toggleConfig] = useSessionStore(
    (s) => [s.showAgentSettings, s.toggleConfig],
    shallow,
  );

  return (
    <ChatHeader
      left={
        <>
          <Avatar
            avatar={meta?.avatar}
            background={meta?.backgroundColor}
            onClick={() => {
              Router.push(`/chat/${id}/edit`);
            }}
            size={40}
            style={{ cursor: 'pointer' }}
            title={meta?.title}
          />
          <HeaderTitle
            desc={meta?.description || t('noDescription')}
            tag={<Tag>{modle}</Tag>}
            title={meta?.title || t('defaultAgent')}
          />
        </>
      }
      right={
        id && (
          <>
            <ActionIcon
              icon={Share2}
              onClick={() => {
                // genShareUrl();
              }}
              size={{ fontSize: 24 }}
              title={t('share')}
            />
            <ActionIcon
              icon={showAgentSettings ? PanelRightClose : PanelRightOpen}
              onClick={() => toggleConfig()}
              size={{ fontSize: 24 }}
              title={t('roleAndArchive')}
            />
            <ActionIcon
              icon={Settings}
              onClick={() => {
                Router.push(`/chat/${id}/edit`);
              }}
              size={{ fontSize: 24 }}
              title={t('header.session', { ns: 'setting' })}
            />
          </>
        )
      }
    />
  );
});

export default Header;
