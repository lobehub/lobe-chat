'use client';

import { Avatar, Flexbox, Text } from '@lobehub/ui';

import { useAuthorInfo } from '@/business/client/hooks/useAuthorInfo';

interface DeletedByCellProps {
  userId: string | null;
}

/**
 * Who moved a root into the workspace bin. Owners see every member's deletions,
 * so the row names its deleter; a removed member or an unloaded roster shows a dash.
 */
const DeletedByCell = ({ userId }: DeletedByCellProps) => {
  const author = useAuthorInfo(userId ?? undefined);
  const name = author?.fullName;

  if (!name) return <Text type={'secondary'}>—</Text>;

  return (
    <Flexbox horizontal align={'center'} gap={6} style={{ minWidth: 0 }}>
      <Avatar avatar={author.avatar || name} size={20} style={{ flexShrink: 0 }} title={name} />
      <Text ellipsis={{ tooltip: name, tooltipWhenOverflow: true }} type={'secondary'}>
        {name}
      </Text>
    </Flexbox>
  );
};

export default DeletedByCell;
