'use client';

import { Button, Highlighter, Icon } from '@lobehub/ui';
import { Card, Result } from 'antd';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

const FailedPage = memo(() => {
  const { t } = useTranslation('oauth');
  const [reason] = useQueryState('reason');
  const [errorMessage] = useQueryState<string>('errorMessage', parseAsString);

  return (
    <Center height="100vh">
      <Card
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          minHeight: 280,
          minWidth: 500,
          width: '100%',
        }}
      >
        <Result
          extra={
            <Link href="/">
              <Button type="primary">{t('error.backToHome')}</Button>
            </Link>
          }
          icon={<Icon icon={ShieldX} />}
          status="error"
          subTitle={
            <Flexbox gap={8}>
              {t('error.desc', {
                reason: t(`error.reason.${reason}` as any, { defaultValue: reason }),
              })}

              {!!errorMessage && <Highlighter language={'log'}>{errorMessage}</Highlighter>}
            </Flexbox>
          }
          title={t('error.title')}
        />
      </Card>
    </Center>
  );
});

FailedPage.displayName = 'FailedPage';

export default FailedPage;
