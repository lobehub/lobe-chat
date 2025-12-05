'use client';

import { ActionIcon, Avatar, Dropdown, Icon, Tag, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BotMessageSquareIcon, CloudIcon, Loader2Icon, MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import NavHeader from '@/features/NavHeader';

import { usePageEditorContext } from '../Context';
import Breadcrumb from './Breadcrumb';
import { useMenu } from './useMenu';

dayjs.extend(relativeTime);

const Header = memo(() => {
  const { t } = useTranslation('file');
  const theme = useTheme();

  const {
    chatPanelExpanded,
    currentEmoji,
    currentTitle,
    knowledgeBaseId,
    lastUpdatedTime,
    parentId,
    saveStatus,
    toggleChatPanel,
  } = usePageEditorContext();

  const { menuItems } = useMenu();

  return (
    <NavHeader
      left={
        <>
          {/* Breadcrumb - show when document has a parent folder */}
          {parentId && (
            <Breadcrumb
              documentTitle={currentTitle || t('documentEditor.titlePlaceholder')}
              knowledgeBaseId={knowledgeBaseId}
              parentId={parentId}
            />
          )}
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
          {/* Last Updated Time */}
          {lastUpdatedTime && (
            <Tag
              icon={
                saveStatus === 'saving' ? (
                  <Icon color={theme.colorTextDescription} icon={Loader2Icon} spin />
                ) : (
                  <Icon color={theme.colorTextDescription} icon={CloudIcon} />
                )
              }
              style={{
                color: theme.colorTextTertiary,
                fontSize: 12,
                marginLeft: 8,
                whiteSpace: 'nowrap',
              }}
            >
              {t('documentEditor.editedAt', { time: dayjs(lastUpdatedTime).fromNow() })}
            </Tag>
          )}
        </>
      }
      right={
        <>
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
