import { ClipboardCheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import { usePublishDynamicRouteMeta } from '@/features/RouteMeta/usePublishDynamicRouteMeta';
import type { DynamicRouteMetaProps } from '@/spa/router/routeMeta';
import { routeMeta } from '@/spa/router/routeMeta';

import { useAcceptanceBundle, useVerifyReportBundle } from './hooks';

// Routes without an `:acceptanceId` (e.g. the `/acceptance` index) must not
// publish the fallback — it would pin every such tab to the same static label.
export const resolveAcceptanceDynamicTitle = (
  subjectTitle: string | null | undefined,
  acceptanceId: string | null | undefined,
  translate: (key: string) => string,
): string | undefined =>
  subjectTitle || (acceptanceId ? translate('acceptance.titleFallback') : undefined);

const AcceptanceDynamicMeta = ({ onResolve, params }: DynamicRouteMetaProps) => {
  const { t } = useTranslation('verify');
  const { data } = useAcceptanceBundle(params.acceptanceId ?? null);
  const translate = t as unknown as (key: string) => string;

  usePublishDynamicRouteMeta(
    {
      title: resolveAcceptanceDynamicTitle(data?.subject.title, params.acceptanceId, translate),
    },
    onResolve,
  );

  return null;
};

export const acceptanceRouteMeta = routeMeta({
  DynamicMeta: AcceptanceDynamicMeta,
  icon: ClipboardCheckIcon,
  Skeleton: createSurfaceSkeleton('detail'),
  titleKey: 'verify:acceptance.titleFallback',
});

const VerifyDynamicMeta = ({ onResolve, params }: DynamicRouteMetaProps) => {
  const { t } = useTranslation('verify');
  const { data } = useVerifyReportBundle(params.runId ?? null);

  usePublishDynamicRouteMeta(
    {
      title: data?.run.title || t('report.titleFallback'),
    },
    onResolve,
  );

  return null;
};

/**
 * Standalone verification-report route (`/verify/:runId`). Drives the browser
 * tab / desktop tab title off the report title via the shared route-meta layer,
 * so we don't hand-roll `document.title`.
 */
export const verifyRouteMeta = routeMeta({
  DynamicMeta: VerifyDynamicMeta,
  icon: ClipboardCheckIcon,
  Skeleton: createSurfaceSkeleton('detail'),
});

export const verifyReportsRouteMeta = routeMeta({
  icon: ClipboardCheckIcon,
  Skeleton: createSurfaceSkeleton('list'),
  titleKey: 'navigation.verifyReports',
});
