'use client';

import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Bot, SquarePlus, UsersRound } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import SyncStatusTag from '@/features/SyncStatusInspector';
import { useActionSWR } from '@/libs/swr';
import { useChatGroupStore } from '@/store/chatGroup';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import TogglePanelButton from '../../../features/TogglePanelButton';
import SessionSearchBar from '../../features/SessionSearchBar';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    color: ${token.colorText};
    fill: ${token.colorText};
  `,
  top: css`
    position: sticky;
    inset-block-start: 0;
    padding-block-start: 10px;
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [createSession] = useSessionStore((s) => [s.createSession]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);
  const { enableWebrtc, showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // We need pass inital member list so we cannot use mutate
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'session.createSession',
    () => createSession(),
  );

  const handleCreateGroupWithMembers = async (selectedAgents: string[]) => {
    setIsGroupModalOpen(false);
    setIsCreatingGroup(true);
    try {
      await createGroup(
        {
          title: 'New Group Chat',
        },
        selectedAgents,
      );
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupModalCancel = () => {
    setIsGroupModalOpen(false);
  };

  return (
    <Flexbox className={styles.top} gap={16} paddingInline={8}>
      <Flexbox align={'flex-start'} horizontal justify={'space-between'}>
        <Flexbox
          align={'center'}
          gap={4}
          horizontal
          style={{
            paddingInlineStart: 4,
            paddingTop: 2,
          }}
        >
          <ProductLogo className={styles.logo} size={36} type={'text'} />
          {enableWebrtc && <SyncStatusTag />}
        </Flexbox>
        <Flexbox align={'center'} gap={4} horizontal>
          <TogglePanelButton />
          {showCreateSession && (
            <Dropdown
              menu={{
                items: [
                  {
                    icon: <Icon icon={Bot} />,
                    key: 'newAgent',
                    label: t('newAgent'),
                    onClick: () => {
                      mutateAgent();
                    },
                  },
                  ...(enableGroupChat ? [
                    {
                      icon: <Icon icon={UsersRound} />,
                      key: 'newGroup',
                      label: t('newGroupChat'),
                      onClick: () => {
                        setIsGroupModalOpen(true);
                      },
                    },
                  ] : []),
                ],
              }}
              trigger={['hover']}
            >
              <ActionIcon
                icon={SquarePlus}
                loading={isValidatingAgent || isCreatingGroup}
                size={DESKTOP_HEADER_ICON_SIZE}
                style={{ flex: 'none' }}
              />
            </Dropdown>
          )}
        </Flexbox>
      </Flexbox>
      <SessionSearchBar />

      {enableGroupChat && (
        <MemberSelectionModal
          mode="create"
          onCancel={handleGroupModalCancel}
          onConfirm={handleCreateGroupWithMembers}
          open={isGroupModalOpen}
        />
      )}
    </Flexbox>
  );
});

export default Header;
