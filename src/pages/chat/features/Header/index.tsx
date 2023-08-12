import { SiOpenai } from '@icons-pack/react-simple-icons';
import { ActionIcon, Avatar, ChatHeader } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { PanelRightClose, PanelRightOpen, Settings } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderTitle from '@/components/HeaderTitle';
import Tag from '@/components/Tag';
import { useGlobalStore } from '@/store/global';
import { agentSelectors, useSessionHydrated, useSessionStore } from '@/store/session';

import PluginTag from './PluginTag';

const Header = memo<{ settings?: boolean }>(({ settings = true }) => {
  const init = useSessionHydrated();
  const { t } = useTranslation('common');

  const [title, description, avatar, backgroundColor, id, model, plugins] = useSessionStore((s) => [
    agentSelectors.currentAgentTitle(s),
    agentSelectors.currentAgentDescription(s),
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentBackgroundColor(s),
    s.activeId,
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentPlugins(s),
  ]);

  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  return (
    <ChatHeader
      left={
        !init ? (
          <Flexbox horizontal>
            <Skeleton
              active
              avatar={{ shape: 'circle', size: 'default' }}
              paragraph={false}
              round
              title={{ style: { margin: 0, marginTop: 8 }, width: 200 }}
            />
          </Flexbox>
        ) : (
          <Flexbox align={'flex-start'} gap={12} horizontal>
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
                  <Tag>
                    <SiOpenai size={'11px'} style={{ marginTop: 2 }} />
                    {model}
                  </Tag>
                  {plugins?.length > 0 && <PluginTag plugins={plugins} />}
                </>
              }
              title={title}
            />
          </Flexbox>
        )
      }
      right={
        <>
          {/*<ActionIcon*/}
          {/*  icon={Share2}*/}
          {/*  onClick={() => {*/}
          {/*    // genShareUrl();*/}
          {/*  }}*/}
          {/*  size={{ fontSize: 24 }}*/}
          {/*  title={t('share')}*/}
          {/*/>*/}
          <ActionIcon
            icon={showAgentSettings ? PanelRightClose : PanelRightOpen}
            onClick={() => toggleConfig()}
            size={{ fontSize: 24 }}
            title={t('roleAndArchive')}
          />
          {settings && (
            <ActionIcon
              icon={Settings}
              onClick={() => {
                Router.push(`/chat/${id}/setting`);
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
