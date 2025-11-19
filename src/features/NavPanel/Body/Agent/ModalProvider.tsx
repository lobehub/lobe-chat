'use client';

import { ReactNode, createContext, memo, useContext, useMemo, useState } from 'react';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { MemberSelectionModal } from '@/components/MemberSelectionModal';

import ConfigGroupModal from './Modals/ConfigGroupModal';
import CreateGroupModal from './Modals/CreateGroupModal';
import RenameGroupModal from './Modals/RenameGroupModal';

interface AgentModalContextValue {
  closeAllModals: () => void;
  closeConfigGroupModal: () => void;
  closeCreateGroupModal: () => void;
  closeGroupWizardModal: () => void;
  closeMemberSelectionModal: () => void;
  closeRenameGroupModal: () => void;
  openConfigGroupModal: () => void;
  openCreateGroupModal: (sessionId: string) => void;
  openGroupWizardModal: (callbacks: GroupWizardCallbacks) => void;
  openMemberSelectionModal: (callbacks: MemberSelectionCallbacks) => void;
  openRenameGroupModal: (groupId: string) => void;
}

interface GroupWizardCallbacks {
  onCancel?: () => void;
  onCreateCustom?: (
    selectedAgents: string[],
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => Promise<void>;
  onCreateFromTemplate?: (
    templateId: string,
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
    selectedMemberTitles?: string[],
  ) => Promise<void>;
}

interface MemberSelectionCallbacks {
  onCancel?: () => void;
  onConfirm?: (
    selectedAgents: string[],
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => Promise<void>;
}

const AgentModalContext = createContext<AgentModalContextValue | null>(null);

export const useAgentModal = () => {
  const context = useContext(AgentModalContext);
  if (!context) {
    throw new Error('useAgentModal must be used within AgentModalProvider');
  }
  return context;
};

interface AgentModalProviderProps {
  children: ReactNode;
}

export const AgentModalProvider = memo<AgentModalProviderProps>(({ children }) => {
  // CreateGroupModal state
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [createGroupSessionId, setCreateGroupSessionId] = useState<string>('');

  // RenameGroupModal state
  const [renameGroupModalOpen, setRenameGroupModalOpen] = useState(false);
  const [renameGroupId, setRenameGroupId] = useState<string>('');

  // ConfigGroupModal state
  const [configGroupModalOpen, setConfigGroupModalOpen] = useState(false);

  // GroupWizard state
  const [groupWizardOpen, setGroupWizardOpen] = useState(false);
  const [groupWizardCallbacks, setGroupWizardCallbacks] = useState<GroupWizardCallbacks>({});

  // MemberSelection state
  const [memberSelectionOpen, setMemberSelectionOpen] = useState(false);
  const [memberSelectionCallbacks, setMemberSelectionCallbacks] =
    useState<MemberSelectionCallbacks>({});

  const contextValue = useMemo<AgentModalContextValue>(
    () => ({
      closeAllModals: () => {
        setCreateGroupModalOpen(false);
        setRenameGroupModalOpen(false);
        setConfigGroupModalOpen(false);
        setGroupWizardOpen(false);
        setMemberSelectionOpen(false);
      },
      closeConfigGroupModal: () => setConfigGroupModalOpen(false),
      closeCreateGroupModal: () => setCreateGroupModalOpen(false),
      closeGroupWizardModal: () => setGroupWizardOpen(false),
      closeMemberSelectionModal: () => setMemberSelectionOpen(false),
      closeRenameGroupModal: () => setRenameGroupModalOpen(false),
      openConfigGroupModal: () => setConfigGroupModalOpen(true),
      openCreateGroupModal: (sessionId: string) => {
        setCreateGroupSessionId(sessionId);
        setCreateGroupModalOpen(true);
      },
      openGroupWizardModal: (callbacks: GroupWizardCallbacks) => {
        setGroupWizardCallbacks(callbacks);
        setGroupWizardOpen(true);
      },
      openMemberSelectionModal: (callbacks: MemberSelectionCallbacks) => {
        setMemberSelectionCallbacks(callbacks);
        setMemberSelectionOpen(true);
      },
      openRenameGroupModal: (groupId: string) => {
        setRenameGroupId(groupId);
        setRenameGroupModalOpen(true);
      },
    }),
    [],
  );

  return (
    <AgentModalContext.Provider value={contextValue}>
      {children}

      {/* All modals rendered at top level */}
      {createGroupModalOpen && (
        <CreateGroupModal
          id={createGroupSessionId}
          onCancel={() => setCreateGroupModalOpen(false)}
          open={createGroupModalOpen}
        />
      )}

      {renameGroupModalOpen && (
        <RenameGroupModal
          id={renameGroupId}
          onCancel={() => setRenameGroupModalOpen(false)}
          open={renameGroupModalOpen}
        />
      )}

      <ConfigGroupModal
        onCancel={() => setConfigGroupModalOpen(false)}
        open={configGroupModalOpen}
      />

      <ChatGroupWizard
        isCreatingFromTemplate={false}
        onCancel={() => {
          groupWizardCallbacks.onCancel?.();
          setGroupWizardOpen(false);
        }}
        onCreateCustom={async (selectedAgents, hostConfig, enableSupervisor) => {
          await groupWizardCallbacks.onCreateCustom?.(selectedAgents, hostConfig, enableSupervisor);
        }}
        onCreateFromTemplate={async (
          templateId,
          hostConfig,
          enableSupervisor,
          selectedMemberTitles,
        ) => {
          await groupWizardCallbacks.onCreateFromTemplate?.(
            templateId,
            hostConfig,
            enableSupervisor,
            selectedMemberTitles,
          );
        }}
        open={groupWizardOpen}
      />

      <MemberSelectionModal
        mode="create"
        onCancel={() => {
          memberSelectionCallbacks.onCancel?.();
          setMemberSelectionOpen(false);
        }}
        onConfirm={async (selectedAgents, hostConfig, enableSupervisor) => {
          await memberSelectionCallbacks.onConfirm?.(selectedAgents, hostConfig, enableSupervisor);
        }}
        open={memberSelectionOpen}
      />
    </AgentModalContext.Provider>
  );
});
