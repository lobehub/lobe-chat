'use client';

import { Icon } from '@lobehub/ui';
import { Button } from '@lobehub/ui/base-ui';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import { useAcceptanceScope } from './AcceptanceScope';
import { acceptanceCheckPath } from './routes';
import { checksForTurn } from './turnChecks';
import { useAcceptanceBundle } from './useAcceptanceBundle';
import { readAcceptanceTurn } from './useAcceptanceTurn';

const AcceptanceEnterFocus = () => {
  const { t } = useTranslation('verify');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { acceptanceId, embedded } = useAcceptanceScope();
  const { data } = useAcceptanceBundle(acceptanceId);
  const checks = data ? checksForTurn(data, readAcceptanceTurn(params)) : [];
  if (embedded || !data || checks.length === 0) return null;

  return (
    <Button
      icon={<Icon icon={ChevronRight} />}
      size={'small'}
      style={{ alignSelf: 'flex-start', minHeight: 44 }}
      type={'text'}
      onClick={() =>
        navigate(
          acceptanceCheckPath(acceptanceId, checks[0]!.id) + (params.size ? `?${params}` : ''),
          { replace: true },
        )
      }
    >
      {t('acceptance.focus.enter')}
    </Button>
  );
};

export default AcceptanceEnterFocus;
