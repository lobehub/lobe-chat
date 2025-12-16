'use client';

import { Text, Tooltip } from '@lobehub/ui';
import { Badge } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import CateTag from '@/app/[variants]/(main)/memory/features/CateTag';
import DetailLoading from '@/app/[variants]/(main)/memory/features/DetailLoading';
import DetailPanel from '@/app/[variants]/(main)/memory/features/DetailPanel';
import HashTags from '@/app/[variants]/(main)/memory/features/HashTags';
import HighlightedContent from '@/app/[variants]/(main)/memory/features/HighlightedContent';
import ProgressIcon from '@/app/[variants]/(main)/memory/features/ProgressIcon';
import SourceLink from '@/app/[variants]/(main)/memory/features/SourceLink';
import Time from '@/app/[variants]/(main)/memory/features/Time';
import { useQueryState } from '@/hooks/useQueryParam';
import { useUserMemoryStore } from '@/store/userMemory';
import { LayersEnum } from '@/types/userMemory';

const ContextRightPanel = memo(() => {
  const theme = useTheme();
  const [contextId] = useQueryState('contextId', { clearOnDefault: true });
  const useFetchMemoryDetail = useUserMemoryStore((s) => s.useFetchMemoryDetail);

  const { data: context, isLoading } = useFetchMemoryDetail(contextId, LayersEnum.Context);

  if (!contextId) return null;

  let content;
  if (isLoading) content = <DetailLoading />;
  if (context)
    content = (
      <>
        <CateTag cate={context.type} />
        <Text
          as={'h1'}
          fontSize={20}
          style={{
            lineHeight: 1.4,
            marginBottom: 0,
          }}
          weight={'bold'}
        >
          {context.title}
          <Tooltip title={context.currentStatus}>
            <Center flex={'none'} height={20} style={{ display: 'inline-flex' }} width={20}>
              <Badge
                status="processing"
                style={{ marginLeft: 8 }}
                styles={{
                  indicator: { alignSelf: 'center', marginBottom: 4 },
                }}
              />
            </Center>
          </Tooltip>
        </Text>
        <Flexbox align="center" gap={16} horizontal>
          <ProgressIcon
            format={(percent) => `Impact: ${percent}%`}
            percent={(context.scoreImpact ?? 0) * 100}
            showInfo
          />
          <ProgressIcon
            format={(percent) => `Urgency: ${percent}%`}
            percent={(context.scoreUrgency ?? 0) * 100}
            showInfo
            strokeColor={(context.scoreUrgency ?? 0) >= 0.7 ? theme.colorError : theme.colorWarning}
          />
        </Flexbox>
        <Flexbox align="center" gap={16} horizontal justify="space-between">
          <SourceLink source={context.source} />
          <Time updatedAt={context.createdAt} />
        </Flexbox>
        <HighlightedContent>{context.description}</HighlightedContent>
        <HashTags hashTags={context.tags} />
      </>
    );

  return <DetailPanel>{content}</DetailPanel>;
});

export default ContextRightPanel;
