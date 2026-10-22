'use client';

import { Button, Center, Empty, ModalFooter, useModalContext } from '@lobehub/ui';
import { SkillsIcon } from '@lobehub/ui/icons';
import { FileWarningIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Loading from '@/components/Loading/CircleLoading';
import { buildAgentDocumentPath } from '@/features/AgentDocumentPage/navigation';
import SkillViewer from '@/features/SkillViewer';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

import { useAgentSkill } from './useAgentSkill';

export interface AgentSkillModalContentProps {
  /** The skill bundle row or its `SKILL.md` index row, from `agent_documents.id`. */
  agentDocumentId: string;
  agentId: string;
}

/**
 * One of an agent's managed skills, read-only. Editing happens on the skill's
 * own document page, which the footer opens.
 */
const AgentSkillModalContent = ({ agentDocumentId, agentId }: AgentSkillModalContentProps) => {
  const { t } = useTranslation(['chat', 'common']);
  const { close } = useModalContext();
  const navigate = useWorkspaceAwareNavigate();
  const { data: skill, error, isLoading, mutate } = useAgentSkill(agentId, agentDocumentId);

  if (isLoading) return <Loading />;

  if (error || !skill) {
    return (
      <Center flex={1} gap={12}>
        <Empty
          description={t(error ? 'agentSkillModal.loadFailed' : 'agentSkillModal.notFound')}
          icon={error ? FileWarningIcon : SkillsIcon}
        />
        {error && <Button onClick={() => void mutate()}>{t('retry', { ns: 'common' })}</Button>}
      </Center>
    );
  }

  const openDocument = () => {
    close();
    navigate(buildAgentDocumentPath(agentId, skill.index.documentId));
  };

  return (
    <>
      <SkillViewer content={skill.content} entityId={`agent-skill:${skill.index.documentId}`} />
      <ModalFooter>
        <Button onClick={openDocument}>{t('agentSkillModal.openDocument')}</Button>
      </ModalFooter>
    </>
  );
};

export default AgentSkillModalContent;
