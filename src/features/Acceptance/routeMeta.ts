import { ClipboardCheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import { usePublishDynamicRouteMeta } from '@/features/RouteMeta/usePublishDynamicRouteMeta';
import type { DynamicRouteMetaProps } from '@/spa/router/routeMeta';
import { routeMeta } from '@/spa/router/routeMeta';

import { useAcceptanceBundle } from './hooks';

const AcceptanceDynamicMeta = ({ onResolve, params }: DynamicRouteMetaProps) => {
  const { t } = useTranslation('verify');
  const { data } = useAcceptanceBundle(params.acceptanceId ?? null);

  usePublishDynamicRouteMeta(
    { title: data?.subject.title || t('acceptance.titleFallback') },
    onResolve,
  );

  return null;
};

export const acceptanceRouteMeta = routeMeta({
  DynamicMeta: AcceptanceDynamicMeta,
  icon: ClipboardCheckIcon,
  Skeleton: createSurfaceSkeleton('detail'),
});
