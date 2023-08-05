import { ActionIcon, Avatar, ChatHeader } from '@lobehub/ui';
import { PanelRightClose, PanelRightOpen, Settings, Share2 } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import HeaderTitle from '@/components/HeaderTitle';
import Tag, { PluginTag } from '@/components/Tag';
import { agentSelectors, useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

const Header = memo(() => {
  const { t } = useTranslation('common');

  const [title, description, avatar, backgroundColor, id, model, plugins] = useSessionStore(
    (s) => [
      agentSelectors.currentAgentTitle(s),
      agentSelectors.currentAgentDescription(s),
      agentSelectors.currentAgentAvatar(s),
      agentSelectors.currentAgentBackgroundColor(s),
      s.activeId,
      agentSelectors.currentAgentModel(s),
      agentSelectors.currentAgentPlugins(s),
    ],
    shallow,
  );

  const [showAgentSettings, toggleConfig] = useSettings(
    (s) => [s.showAgentConfig, s.toggleAgentPanel],
    shallow,
  );

  return (
    <ChatHeader
      left={
        <>
          <Avatar
            avatar={avatar}
            background={backgroundColor}
            onClick={() => {
              Router.push(`/chat/${id}/setting`);
            }}
            size={40}
            style={{ cursor: 'pointer', flex: 'none' }}
            title={title}
          />
          <HeaderTitle
            desc={description}
            tag={
              <>
                <Tag capitalize type={'openai'}>
                  {model}
                </Tag>
                {plugins?.length > 1 && <PluginTag plugins={plugins} />}
              </>
            }
            title={title}
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
                Router.push(`/chat/${id}/setting`);
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
