'use client';

import type { SharedAgentData } from '@lobechat/types';
import { Center, Flexbox } from '@lobehub/ui';
import { Button, Text } from '@lobehub/ui/base-ui';
import { memo, type PropsWithChildren, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router';

import AsyncError from '@/components/AsyncError';
import { RouteMetaBridge } from '@/features/RouteMeta';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRouteSkeleton } from '@/spa/router/useRouteSkeleton';

import { resolveShareAccessState, SHARE_ACCESS_ERROR_KEYS } from './resolveShareAccessState';
import { useSharedAgent } from './useSharedAgent';
import { buildAgentShareOwnerPath, buildAgentShareSignInUrl } from './visitorPath';
import VisitorTopBar from './VisitorTopBar';

/**
 * Product bar plus the page body below it. Every state of the share — the
 * profile, the conversation, the sign-in prompt, the dead-link card — sits
 * inside the same frame, so the bar never appears or disappears as the share
 * resolves.
 */
export const VisitorShell = ({
  children,
  horizontal,
  slugOrId,
}: PropsWithChildren<{ horizontal?: boolean; slugOrId?: string }>) => (
  <Flexbox height={'100%'} style={{ overflow: 'hidden' }} width={'100%'}>
    <RouteMetaBridge />
    <VisitorTopBar slugOrId={slugOrId} />
    <Flexbox
      flex={1}
      horizontal={horizontal}
      style={{ minHeight: 0, overflow: 'hidden' }}
      width={'100%'}
    >
      {children}
    </Flexbox>
  </Flexbox>
);

interface ShareGateProps {
  children: (data: SharedAgentData, slugOrId: string) => ReactNode;
  /** The conversation surface lays its panes out side by side; the profile does not. */
  horizontal?: boolean;
}

/**
 * Resolves the share and owns every state that is not "here is the agent":
 * loading, sign-in, dead link, forbidden, and the creator redirect. Both the
 * profile (`/a/:slugOrId`) and the conversation (`/a/:slugOrId/chat`) mount it
 * so those states stay identical across the two surfaces.
 */
const ShareGate = memo<ShareGateProps>(({ children, horizontal }) => {
  const { t } = useTranslation('agent');
  const { slugOrId, topicId } = useParams<{ slugOrId: string; topicId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const RouteSkeleton = useRouteSkeleton();

  const { data, error, isLoading, mutate } = useSharedAgent(slugOrId);

  /**
   * Reuse the route-owned fallback while data loads. Importing that skeleton
   * back into this lazy page changes the initial shell's shared chunk graph.
   */
  if (isLoading && !data) return RouteSkeleton ? <RouteSkeleton /> : null;

  if (error || !data) {
    const state = resolveShareAccessState(error);

    if (state === 'signIn') {
      const signInUrl = buildAgentShareSignInUrl(slugOrId ?? '', topicId);

      return (
        <VisitorShell slugOrId={slugOrId}>
          <Center gap={16} height={'100%'} padding={24}>
            <Text fontSize={16} weight={600}>
              {t('share.visitor.access.signInTitle')}
            </Text>
            <Text style={{ maxWidth: 360, textAlign: 'center' }} type={'secondary'}>
              {t('share.visitor.access.signInDesc')}
            </Text>
            <Button href={signInUrl} size={'large'} type={'primary'}>
              {t('share.visitor.access.signInCta')}
            </Button>
          </Center>
        </VisitorShell>
      );
    }

    const title =
      state === 'generic'
        ? undefined
        : t(SHARE_ACCESS_ERROR_KEYS[state] as 'share.visitor.access.notFound');

    return (
      <VisitorShell slugOrId={slugOrId}>
        <Center height={'100%'} padding={24}>
          <AsyncError
            error={error}
            title={title}
            variant={'page'}
            // A missing / forbidden share never becomes available by retrying,
            // so there is no `onRetry` for those states — the `action` button
            // below is the visitor's only way out of the dead end.
            action={
              state === 'generic' ? undefined : (
                <Button size={'small'} onClick={() => navigate('/')}>
                  {t('share.visitor.access.backHome')}
                </Button>
              )
            }
            onRetry={state === 'generic' ? () => void mutate() : undefined}
          />
        </Center>
      </VisitorShell>
    );
  }

  // The creator is never a visitor of their own share: the visitor chrome
  // (empty topic list, "runs on the creator's account" notice) is meaningless
  // to them, so send them to the share settings instead.
  if (data.isOwner)
    return <Navigate replace to={buildAgentShareOwnerPath(data.agentId, { mobile: isMobile })} />;

  return (
    <VisitorShell horizontal={horizontal} slugOrId={slugOrId}>
      {children(data, slugOrId ?? '')}
    </VisitorShell>
  );
});

ShareGate.displayName = 'AgentShareGate';

export default ShareGate;
