import type { BriefArtifactDocument, BriefArtifacts } from '@lobechat/types';
import { Block, createStaticStyles, cssVar, Flexbox, Icon, Text } from '@lobehub/ui';
import { SkillsIcon } from '@lobehub/ui/icons';
import { ChevronRightIcon, FileTextIcon, type LucideIcon } from 'lucide-react';
import { memo } from 'react';

import { openAgentSkillModal, preloadAgentSkillModal } from '@/features/AgentSkillModal/loader';
import { openDocumentModal, preloadDocumentModal } from '@/features/DocumentModal/loader';

import { resolveBriefArtifactTarget } from './briefArtifactTarget';

const styles = createStaticStyles(({ css, cssVar }) => ({
  iconWrap: css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;
    border-radius: 8px;

    background: ${cssVar.colorBgContainer};
  `,
}));

interface BriefArtifactCardProps {
  icon: LucideIcon;
  onOpen: () => void;
  onPreload: () => void;
  title: string;
}

const BriefArtifactCard = ({ icon, onOpen, onPreload, title }: BriefArtifactCardProps) => (
  <Block
    clickable
    horizontal
    align={'center'}
    gap={12}
    paddingBlock={10}
    paddingInline={12}
    variant={'filled'}
    onClick={onOpen}
    onFocus={onPreload}
    onPointerEnter={onPreload}
  >
    <div className={styles.iconWrap}>
      <Icon color={cssVar.colorTextSecondary} icon={icon} size={{ size: 20, strokeWidth: 1.5 }} />
    </div>
    <Text ellipsis style={{ flex: 1, minWidth: 0 }} weight={500}>
      {title}
    </Text>
    <Icon
      color={cssVar.colorTextQuaternary}
      icon={ChevronRightIcon}
      size={16}
      style={{ flexShrink: 0 }}
    />
  </Block>
);

const SKILL_ICON = SkillsIcon as unknown as LucideIcon;

const BriefArtifact = ({
  agentId,
  doc,
}: {
  agentId?: string | null;
  doc: BriefArtifactDocument;
}) => {
  const target = resolveBriefArtifactTarget(doc, agentId);
  if (!target) return null;

  const title = doc.title || 'Untitled';

  if (target.type === 'skill') {
    return (
      <BriefArtifactCard
        icon={SKILL_ICON}
        title={title}
        onPreload={preloadAgentSkillModal}
        onOpen={() =>
          void openAgentSkillModal({
            agentDocumentId: target.agentDocumentId,
            agentId: target.agentId,
            title: doc.title,
          })
        }
      />
    );
  }

  return (
    <BriefArtifactCard
      icon={FileTextIcon}
      title={title}
      onOpen={() => void openDocumentModal(target.documentId)}
      onPreload={preloadDocumentModal}
    />
  );
};

interface BriefCardArtifactsProps {
  /** The agent the brief is about; a skill artifact is one of its skills. */
  agentId?: string | null;
  artifacts?: BriefArtifacts | null;
}

const BriefCardArtifacts = memo<BriefCardArtifactsProps>(({ agentId, artifacts }) => {
  const docs = artifacts?.documents;
  if (!docs?.length) return null;

  return (
    <Flexbox gap={8}>
      {docs.map((doc) => (
        <BriefArtifact agentId={agentId} doc={doc} key={doc.id} />
      ))}
    </Flexbox>
  );
});

export default BriefCardArtifacts;
