import { SiOpenai } from '@icons-pack/react-simple-icons';
import { ActionIcon, Avatar, ChatHeader, ChatHeaderTitle, Tag } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { PanelRightClose, PanelRightOpen, Settings } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { useSessionChatInit, useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';

import PluginTag from './PluginTag';
import ShareButton from './ShareButton';

const Header = memo(() => {
  const init = useSessionChatInit();

  const { t } = useTranslation('common');

  const [isInbox, title, description, avatar, backgroundColor, model, plugins] = useSessionStore(
    (s) => [
      sessionSelectors.isInboxSession(s),
      agentSelectors.currentAgentTitle(s),
      agentSelectors.currentAgentDescription(s),
      agentSelectors.currentAgentAvatar(s),
      agentSelectors.currentAgentBackgroundColor(s),
      agentSelectors.currentAgentModel(s),
      agentSelectors.currentAgentPlugins(s),
    ],
  );

  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  const displayTitle = isInbox ? t('inbox.title') : title;
  const displayDesc = isInbox ? t('inbox.desc') : description;

  return (
    <ChatHeader
      left={
        !init ? (
          <Flexbox horizontal>
            <Skeleton
              active
              avatar={{ shape: 'circle', size: 'default' }}
              paragraph={false}
              title={{ style: { margin: 0, marginTop: 8 }, width: 200 }}
            />
          </Flexbox>
        ) : (
          <Flexbox align={'flex-start'} gap={12} horizontal>
            <Avatar avatar={avatar} background={backgroundColor} size={40} title={title} />
            <ChatHeaderTitle
              desc={displayDesc}
              tag={
                <>
                  <Tag icon={<SiOpenai size={'1em'} />}>{model}</Tag>
                  {plugins?.length > 0 && <PluginTag plugins={plugins} />}
                </>
              }
              title={displayTitle}
            />
          </Flexbox>
        )
      }
      right={
        <>
          <ShareButton />
          <ActionIcon
            icon={showAgentSettings ? PanelRightClose : PanelRightOpen}
            onClick={() => toggleConfig()}
            size={{ fontSize: 24 }}
            title={t('roleAndArchive')}
          />
          {!isInbox && (
            <ActionIcon
              icon={Settings}
              onClick={() => {
                Router.push({ hash: location.hash, pathname: `/chat/setting` });
              }}
              size={{ fontSize: 24 }}
              title={t('header.session', { ns: 'setting' })}
            />
          )}
        </>
      }
    />
  );
});

export default Header;
