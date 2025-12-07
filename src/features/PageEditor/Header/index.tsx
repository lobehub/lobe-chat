'use client';

import { ActionIcon, Avatar, Dropdown, Text } from '@lobehub/ui';
import { ArrowLeftIcon, BotMessageSquareIcon, MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import NavHeader from '@/features/NavHeader';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';

import { usePageEditorStore } from '../store';
import AutoSaveHint from './AutoSaveHint';
import Breadcrumb from './Breadcrumb';
import { useMenu } from './useMenu';

const Header = memo(() => {
  const { t } = useTranslation('file');

  const chatPanelExpanded = usePageEditorStore((s) => s.chatPanelExpanded);
  const currentEmoji = usePageEditorStore((s) => s.currentEmoji);
  const currentTitle = usePageEditorStore((s) => s.currentTitle);
  const parentId = usePageEditorStore((s) => s.parentId);
  const onBack = usePageEditorStore((s) => s.onBack);
  const toggleChatPanel = usePageEditorStore((s) => s.toggleChatPanel);

  const { menuItems } = useMenu();

  return (
    <NavHeader
      left={
        <>
          {onBack && <ActionIcon icon={ArrowLeftIcon} onClick={onBack} />}
          {/* Breadcrumb - show when page has a parent folder */}
          {parentId && <Breadcrumb />}
          {/* Show icon and title only when there's no parent folder */}
          {!parentId && (
            <>
              {/* Icon */}
              {currentEmoji && <Avatar avatar={currentEmoji} size={28} />}
              {/* Title */}
              <Text ellipsis style={{ marginLeft: 4 }} weight={500}>
                {currentTitle || t('documentEditor.titlePlaceholder')}
              </Text>
            </>
          )}
          {/* Auto Save Status */}
          <AutoSaveHint />
        </>
      }
      right={
        <>
          <WideScreenButton />
          <ActionIcon
            active={chatPanelExpanded}
            icon={BotMessageSquareIcon}
            onClick={toggleChatPanel}
            size={DESKTOP_HEADER_ICON_SIZE}
          />
          {/* Three-dot menu */}
          <Dropdown
            menu={{
              items: menuItems,
              style: { minWidth: 200 },
            }}
            placement="bottomRight"
            trigger={['click']}
          >
            <ActionIcon icon={MoreHorizontal} size={DESKTOP_HEADER_ICON_SIZE} />
          </Dropdown>
        </>
      }
    />
  );
});

export default Header;
