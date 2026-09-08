'use client';

import type { WorkListBaseItem } from '@lobechat/types';
import { Tag } from '@lobehub/ui/base-ui';
import { Trash2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * i18n key for the "resource deleted" badge, worded per Work type so the user
 * learns *what* is gone (the task / the document), not just that the card is
 * an orphan.
 */
const resourceDeletedKey = (item: Pick<WorkListBaseItem, 'type'>) => {
  switch (item.type) {
    case 'document': {
      return 'workingPanel.works.documentDeleted';
    }
    case 'task': {
      return 'workingPanel.works.taskDeleted';
    }
    default: {
      return 'workingPanel.works.resourceDeleted';
    }
  }
};

/**
 * Warning badge for an orphaned Work: the backing resource was deleted outside
 * the tool path, so the card renders from its snapshot and opening it would
 * 404. Callers gate on `item.resourceDeleted` and also strip the click
 * affordance.
 */
const ResourceDeletedTag = memo<{ item: Pick<WorkListBaseItem, 'type'> }>(({ item }) => {
  const { t } = useTranslation('chat');

  return (
    <Tag color={'warning'} icon={<Trash2Icon size={12} />} size={'small'}>
      {t(resourceDeletedKey(item))}
    </Tag>
  );
});

ResourceDeletedTag.displayName = 'ResourceDeletedTag';

export default ResourceDeletedTag;
