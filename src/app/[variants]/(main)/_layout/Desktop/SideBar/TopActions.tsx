import { ActionIcon, ActionIconProps } from '@lobehub/ui';
import { Compass, FolderClosed, Palette } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import InnerLink from '@/components/InnerLink';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import ChatAction from './ChatAction';

const ICON_SIZE: ActionIconProps['size'] = {
  blockSize: 40,
  size: 24,
  strokeWidth: 2,
};

export interface TopActionProps {
  isPinned?: boolean | null;
  tab?: SidebarTabKey;
}

const TopActions = memo<TopActionProps>(({ tab, isPinned }) => {
  const { t } = useTranslation('common');
  const { showMarket, enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);

  const isFilesActive = tab === SidebarTabKey.Files;
  const isDiscoverActive = tab === SidebarTabKey.Discover;
  const isImageActive = tab === SidebarTabKey.Image;

  return (
    <Flexbox gap={8}>
      <ChatAction isPinned={isPinned} tab={tab} />
      {enableKnowledgeBase && (
        <InnerLink aria-label={t('tab.files')} href={'/files'}>
          <ActionIcon
            active={isFilesActive}
            icon={FolderClosed}
            size={ICON_SIZE}
            title={t('tab.files')}
            tooltipProps={{ placement: 'right' }}
          />
        </InnerLink>
      )}
      <InnerLink aria-label={t('tab.aiImage')} href={'/image'}>
        <ActionIcon
          active={isImageActive}
          icon={Palette}
          size={ICON_SIZE}
          title={t('tab.aiImage')}
          tooltipProps={{ placement: 'right' }}
        />
      </InnerLink>
      {showMarket && (
        <InnerLink aria-label={t('tab.discover')} href={'/discover'}>
          <ActionIcon
            active={isDiscoverActive}
            icon={Compass}
            size={ICON_SIZE}
            title={t('tab.discover')}
            tooltipProps={{ placement: 'right' }}
          />
        </InnerLink>
      )}
    </Flexbox>
  );
});

export default TopActions;
