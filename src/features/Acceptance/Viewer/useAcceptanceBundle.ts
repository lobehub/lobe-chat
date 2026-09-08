import { useEffect } from 'react';

import { useClientDataSWR } from '@/libs/swr';
import { verifyKeys } from '@/libs/swr/keys';
import { verifyService } from '@/services/verify';

import { LIVE_ACCEPTANCE_STATUSES } from './verdict';

const ACCEPTANCE_BUNDLE_SWR_CONFIG = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
} as const;

export const useAcceptanceBundle = (acceptanceId: string | null) => {
  const swr = useClientDataSWR(
    acceptanceId ? verifyKeys.acceptanceBundle(acceptanceId) : null,
    () => verifyService.getAcceptanceBundle(acceptanceId!),
    ACCEPTANCE_BUNDLE_SWR_CONFIG,
  );

  const status = swr.data?.acceptance.status;
  const hasActiveFlow = swr.data?.flows?.some(
    (flow) =>
      flow.versions[0]?.runs.length === 0 ||
      flow.versions.some((version) => version.runs.some((run) => run.status === 'running')),
  );
  useEffect(() => {
    if (!hasActiveFlow && (!status || !LIVE_ACCEPTANCE_STATUSES.has(status))) return;
    const timer = setInterval(() => void swr.mutate(), 5000);
    return () => clearInterval(timer);
  }, [status, hasActiveFlow, swr.mutate]);

  return swr;
};
