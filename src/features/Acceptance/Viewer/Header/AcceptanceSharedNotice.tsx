'use client';

import { Alert } from '@lobehub/ui/base-ui';
import { cssVar } from 'antd-style';
import { UsersRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthorInfo } from '@/business/client/hooks/useAuthorInfo';

import { useAcceptanceScope } from '../AcceptanceScope';
import { useAcceptanceComments } from '../Comments/hooks';
import { useAcceptanceBundle } from '../useAcceptanceBundle';
import { canReviewAcceptance } from '../visibility';

/**
 * In-body notice for viewers who reached this acceptance through someone
 * else's shared link or workspace membership: names the author when the
 * business layer can resolve them, and states what this viewer may actually do
 * — review, join the discussion, or only read — so a page missing its owner
 * controls never looks broken, and so it never promises a reply box that a
 * signed-out reader does not get.
 */
const AcceptanceSharedNotice = ({ style }: { style?: CSSProperties }) => {
  const { t } = useTranslation('verify');
  const { acceptanceId } = useAcceptanceScope();
  const { data } = useAcceptanceBundle(acceptanceId);
  const author = useAuthorInfo(data?.acceptance.userId ?? undefined);
  const { canComment, isLoading: permissionLoading } = useAcceptanceComments(acceptanceId);

  if (!data || data.isOwner) return null;

  return (
    <Alert
      showIcon
      icon={UsersRound}
      style={{ borderRadius: cssVar.borderRadiusLG, ...style }}
      type={'secondary'}
      variant={'outlined'}
      description={t(
        canReviewAcceptance(data)
          ? 'acceptance.sharedNotice.reviewableDescription'
          : // Until the discussion answers, the wider line is the safe guess:
            // telling a reader they may join and then taking it away reads as a
            // bug, while the reverse reads as the page changing its mind.
            canComment || permissionLoading
            ? 'acceptance.sharedNotice.commentableDescription'
            : 'acceptance.sharedNotice.readOnlyDescription',
      )}
      title={
        author?.fullName
          ? t('acceptance.sharedNotice.titleWithName', { name: author.fullName })
          : t('acceptance.sharedNotice.title')
      }
    />
  );
};

export default AcceptanceSharedNotice;
