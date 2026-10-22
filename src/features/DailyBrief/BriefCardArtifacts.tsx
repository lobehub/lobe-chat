import type { BriefArtifactDocument, BriefArtifacts } from '@lobechat/types';
import { Block, Flexbox, Icon, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { ChevronRightIcon, FileTextIcon } from 'lucide-react';
import { memo } from 'react';

import { openDocumentModal, preloadDocumentModal } from '@/features/DocumentModal/loader';

const styles = stylex.create({
  iconWrap: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: cssVar.colorBgContainer,
    backgroundImage: 'none',
  },
});

const BriefArtifactCard = memo<{ doc: BriefArtifactDocument }>(({ doc }) => {
  const title = doc.title || 'Untitled';

  return (
    <Block
      clickable
      horizontal
      align={'center'}
      gap={12}
      paddingBlock={10}
      paddingInline={12}
      variant={'filled'}
      onClick={() => void openDocumentModal(doc.id)}
      onFocus={preloadDocumentModal}
      onPointerEnter={preloadDocumentModal}
    >
      <div {...stylex.props(styles.iconWrap)}>
        <Icon
          color={cssVar.colorTextSecondary}
          icon={FileTextIcon}
          size={{ size: 20, strokeWidth: 1.5 }}
        />
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
});

interface BriefCardArtifactsProps {
  artifacts?: BriefArtifacts | null;
}

const BriefCardArtifacts = memo<BriefCardArtifactsProps>(({ artifacts }) => {
  const docs = artifacts?.documents;
  if (!docs?.length) return null;

  return (
    <Flexbox gap={8}>
      {docs.map((doc) => (
        <BriefArtifactCard doc={doc} key={doc.id} />
      ))}
    </Flexbox>
  );
});

export default BriefCardArtifacts;
