'use client';

import { Icon } from '@lobehub/ui';
import { Result } from 'antd';
import { useTheme } from 'antd-style';
import { LoaderCircle } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ResultLayout from '../../../ResultLayout';

interface BuiltinConsentProps {
  uid: string;
}

const BuiltinConsent = memo<BuiltinConsentProps>(({ uid }) => {
  const { t } = useTranslation('oauth');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Auto-submit on mount
    formRef.current?.submit();
  }, []);

  const theme = useTheme();
  return (
    <>
      <ResultLayout>
        <Result
          icon={<Icon icon={LoaderCircle} spin style={{ color: theme.colorText }} />}
          status="success"
          style={{ padding: 0 }}
          subTitle={t('consent.redirecting')}
          title=""
        />
      </ResultLayout>
      <form action="/oidc/consent" method="post" ref={formRef} style={{ display: 'none' }}>
        <input name="uid" type="hidden" value={uid} />
        <input name="consent" type="hidden" value="accept" />
      </form>
    </>
  );
});

BuiltinConsent.displayName = 'BuiltinConsent';

export default BuiltinConsent;
