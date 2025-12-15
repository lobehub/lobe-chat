'use client';

import { Tag, Text } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import CateTag from '@/app/[variants]/(main)/memory/features/CateTag';
import DetailLoading from '@/app/[variants]/(main)/memory/features/DetailLoading';
import DetailPanel from '@/app/[variants]/(main)/memory/features/DetailPanel';
import HashTags from '@/app/[variants]/(main)/memory/features/HashTags';
import HighlightedContent from '@/app/[variants]/(main)/memory/features/HighlightedContent';
import Time from '@/app/[variants]/(main)/memory/features/Time';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';
import { LayersEnum } from '@/types/userMemory';

const IdentityRightPanel = memo(() => {
  const [identityId] = useQueryState('identityId', { clearOnDefault: true });
  const useFetchMemoryDetail = useUserMemoryStore((s) => s.useFetchMemoryDetail);

  const { data: identity, isLoading } = useFetchMemoryDetail(identityId, LayersEnum.Identity);

  if (!identityId) return null;

  let content;
  if (isLoading) content = <DetailLoading />;
  if (content) {
    const showRelationship = identity.relationship && identity.relationship !== 'self';
    content = (
      <>
        <CateTag cate={identity.type} />
        <Text
          as={'h1'}
          fontSize={20}
          style={{
            lineHeight: 1.4,
            marginBottom: 0,
          }}
          weight={'bold'}
        >
          {identity.role || identity.relationship || 'Identity'}
        </Text>
        <Flexbox align="center" gap={8} horizontal justify={'space-between'} wrap={'wrap'}>
          {showRelationship && <Tag>{identity.relationship}</Tag>}
          <Time updatedAt={identity.updatedAt || identity.createdAt} />
        </Flexbox>
        {identity.description && <HighlightedContent>{identity.description}</HighlightedContent>}
        <HashTags hashTags={identity.tags} />
      </>
    );
  }

  return <DetailPanel>{content}</DetailPanel>;
});

export default IdentityRightPanel;
