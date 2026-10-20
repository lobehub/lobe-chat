'use client';

import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useActiveWorkspaceSlug } from '@/business/client/hooks/useActiveWorkspaceSlug';
import { useWorkspaces } from '@/business/client/hooks/useWorkspaces';
import { useClientDataSWR } from '@/libs/swr';
import { normalizeAsyncError } from '@/libs/swr/normalizeError';
import { createWorkspaceLambdaClient } from '@/libs/trpc/client';

export type ScopedLambdaClient = ReturnType<typeof createWorkspaceLambdaClient>;

/** A scope the user can switch to: personal (`id: null`) or one of their workspaces. */
export interface OtherScope {
  id: string | null;
  name?: string;
  slug?: string;
}

/**
 * Rewrite `pathname` (which may carry the active workspace's slug) into the
 * same route under `target`: `/{slug}/goal/x` ⇄ `/goal/x`.
 */
export const buildOtherScopePath = (
  pathname: string,
  activeSlug: string | null | undefined,
  target: Pick<OtherScope, 'slug'>,
): string => {
  const isPrefixed =
    !!activeSlug && (pathname === `/${activeSlug}` || pathname.startsWith(`/${activeSlug}/`));
  const bare = isPrefixed ? pathname.slice(activeSlug!.length + 1) || '/' : pathname;

  if (!target.slug) return bare;
  return bare === '/' ? `/${target.slug}` : `/${target.slug}${bare}`;
};

/**
 * After a read 404s in the active scope, find which of the user's OTHER scopes
 * (personal or another workspace) the resource lives in, so the page can offer
 * a switch instead of a dead "Failed to load". Rows are scoped server-side by
 * the `X-Workspace-Id` header, so the same id legitimately 404s in every scope
 * but its own.
 *
 * `probe` must reject when the resource is not visible through the given
 * client. Pass a `null` key to skip (e.g. the error is not a 404).
 */
export const useLocateInOtherScope = (
  key: string | null,
  probe: (client: ScopedLambdaClient) => Promise<unknown>,
) => {
  const activeId = useActiveWorkspaceId();
  const workspaces = useWorkspaces();

  const candidates = useMemo<OtherScope[]>(
    () => [
      ...(activeId ? [{ id: null }] : []),
      ...workspaces
        .filter((ws) => ws.id !== activeId && !ws.lockedOut)
        .map((ws) => ({ id: ws.id, name: ws.name, slug: ws.slug })),
    ],
    [activeId, workspaces],
  );

  return useClientDataSWR<OtherScope | null>(
    key && candidates.length > 0
      ? ['locateInOtherScope', key, candidates.map((c) => c.id ?? 'personal').join(',')]
      : null,
    async () => {
      try {
        return await Promise.any(
          candidates.map(async (scope) => {
            await probe(createWorkspaceLambdaClient(scope.id));
            return scope;
          }),
        );
      } catch {
        return null;
      }
    },
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
};

export interface OtherScopeRecovery {
  /** Still probing; show a loading frame rather than flash the generic error. */
  pending: boolean;
  /** The scope that holds the resource, when one was found. */
  scope?: OtherScope;
  /** The current route rewritten into `scope`, query string kept. */
  targetPath?: string;
}

/**
 * Turns a detail page's read `error` into a way out: on a 404, locate the
 * resource in the user's other scopes and build the same route there.
 */
export const useOtherScopeRecovery = (
  error: unknown,
  key: string,
  probe: (client: ScopedLambdaClient) => Promise<unknown>,
): OtherScopeRecovery => {
  const { pathname, search } = useLocation();
  const activeSlug = useActiveWorkspaceSlug();

  const isNotFound = normalizeAsyncError(error).status === 404;
  const { data: scope, isLoading } = useLocateInOtherScope(isNotFound ? key : null, probe);

  if (isNotFound && isLoading) return { pending: true };
  if (!scope) return { pending: false };

  return {
    pending: false,
    scope,
    targetPath: buildOtherScopePath(pathname, activeSlug, scope) + search,
  };
};
