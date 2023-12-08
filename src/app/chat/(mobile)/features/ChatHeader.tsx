import { ActionIcon, MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';

import SettingButton from '../../features/ChatHeader/SettingButton';
import ShareButton from '../../features/ChatHeader/ShareButton';

const MobileHeader = memo(() => {
  const { t } = useTranslation('chat');
  const topicLength = useChatStore(topicSelectors.currentTopicLength);
  const router = useRouter();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const [isInbox, title] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);

  const displayTitle = isInbox ? t('inbox.title') : title;

  // const items: MenuProps['items'] = [
  //   {
  //     icon: <Icon icon={Share2} />,
  //     key: 'share',
  //     label: t('share', { ns: 'common' }),
  //     onClick: () => setOpen(true),
  //   },
  //   !isInbox && {
  //     icon: <Icon icon={Settings} />,
  //     key: 'settings',
  //     label: t('header.session', { ns: 'setting' }),
  //     onClick: () => router.push(pathString('/chat/settings', { hash: location.hash })),
  //   },
  // ].filter(Boolean) as MenuProps['items'];

  return (
    <MobileNavBar
      center={
        <MobileNavBarTitle
          desc={
            <Flexbox align={'center'} gap={4} horizontal onClick={() => toggleConfig()}>
              <ActionIcon
                active
                icon={ChevronDown}
                size={{ blockSize: 14, borderRadius: '50%', fontSize: 12 }}
                style={{
                  background: theme.colorFillSecondary,
                  color: theme.colorTextDescription,
                }}
              />
              <span>{`${t('topic.title')} ${topicLength > 1 ? topicLength + 1 : ''}`}</span>
            </Flexbox>
          }
          title={<div onClick={() => toggleConfig()}>{displayTitle}</div>}
        />
      }
      onBackClick={() => router.push('/chat')}
      right={
        <>
          <ShareButton mobile open={open} setOpen={setOpen} />
          <SettingButton mobile />
          {/*<Dropdown*/}
          {/*  menu={{*/}
          {/*    items,*/}
          {/*  }}*/}
          {/*  trigger={['click']}*/}
          {/*>*/}
          {/*  <ActionIcon icon={MoreHorizontal} />*/}
          {/*</Dropdown>*/}
        </>
      }
      showBackButton
    />
  );
});

export default MobileHeader;
