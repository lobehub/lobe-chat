import { ActionIcon, ActionIconProps, Hotkey } from '@lobehub/ui';
import { Compass, FolderClosed, MessageSquare, Palette } from 'lucide-react';
import { memo, useMemo, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Flexbox } from 'react-layout-kit';

import { INBOX_SESSION_ID } from '@/const/session';
import { SESSION_CHAT_URL } from '@/const/url';
import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { HotkeyEnum } from '@/types/hotkey';

const ICON_SIZE: ActionIconProps['size'] = {
  blockSize: 40,
  size: 24,
  strokeWidth: 2,
};

export interface TopActionProps {
  isPinned?: boolean | null;
  tab?: SidebarTabKey;
}

//  TODO Change icons
const TopActions = memo<TopActionProps>(({ tab, isPinned }) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [switchBackToChat, isMobile] = useGlobalStore((s) => [
    s.switchBackToChat,
    s.isMobile,
  ]);
  const { showMarket, enableKnowledgeBase, showAiImage } =
    useServerConfigStore(featureFlagsSelectors);
  const hotkey = useUserStore(settingsSelectors.getHotkeyById(HotkeyEnum.NavigateToChat));
  const activeSessionId = useSessionStore((s) => s.activeId);
  const chatHref = useMemo(
    () => SESSION_CHAT_URL(activeSessionId || INBOX_SESSION_ID, isMobile),
    [activeSessionId, isMobile],
  );

  const isChatActive = tab === SidebarTabKey.Chat && !isPinned;
  const isKnowledgeActive = tab === SidebarTabKey.Knowledge;
  const isDiscoverActive = tab === SidebarTabKey.Discover;
  const isImageActive = tab === SidebarTabKey.Image;

  const handleNavigate = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  return (
    <Flexbox gap={8}>
      <ActionIcon
        active={isChatActive}
        icon={MessageSquare}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) {
            window.open(chatHref, '_blank');
            return;
          }
          e.preventDefault();
          startTransition(() => {
            switchBackToChat(activeSessionId);
          });
        }}
        size={ICON_SIZE}
        title={
          <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
            <span>{t('tab.chat')}</span>
            <Hotkey inverseTheme keys={hotkey} />
          </Flexbox>
        }
        tooltipProps={{ placement: 'right' }}
      />
      {enableKnowledgeBase && (
        <ActionIcon
          active={isKnowledgeActive}
          icon={FolderClosed}
          onClick={() => handleNavigate('/knowledge')}
          size={ICON_SIZE}
          title={t('tab.knowledgeBase')}
          tooltipProps={{ placement: 'right' }}
        />
      )}
      {showAiImage && (
        <ActionIcon
          active={isImageActive}
          icon={Palette}
          onClick={() => handleNavigate('/image')}
          size={ICON_SIZE}
          title={t('tab.aiImage')}
          tooltipProps={{ placement: 'right' }}
        />
      )}
      {showMarket && (
        <ActionIcon
          active={isDiscoverActive}
          icon={Compass}
          onClick={() => handleNavigate('/discover')}
          size={ICON_SIZE}
          title={t('tab.discover')}
          tooltipProps={{ placement: 'right' }}
        />
      )}
    </Flexbox>
  );
});

export default TopActions;
