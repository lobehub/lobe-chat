import { Button, Icon, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Link2 } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { MemorySource } from '@/database/repositories/userMemory';

const SourceLink = memo<{ source?: MemorySource | null }>(({ source }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  if (!source) return;

  const title = source.topicTitle || source.topicId.replace('tpc_', '').slice(0, 8);

  return (
    <Link
      href={`/agent/${source.agentId}?topicId=${source.topicId}`}
      onClick={(e) => {
        if (!source) return;
        e.stopPropagation();
        e.preventDefault();
        navigate(`/agent/${source.agentId}?topicId=${source.topicId}`);
      }}
      style={{
        flex: 1,
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <Button
        icon={<Icon icon={Link2} />}
        size={'small'}
        style={{
          flex: 1,
          maxWidth: '100%',
          overflow: 'hidden',
        }}
        title={title}
        type={'text'}
      >
        <Text color={theme.colorTextSecondary} ellipsis>
          {title}
        </Text>
      </Button>
    </Link>
  );
});

export default SourceLink;
