import { Icon } from '@lobehub/ui';
import { Segmented } from 'antd';
import { AsteriskSquare, KeySquare } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import APIKeyForm from './APIKeyForm';
import AccessCodeForm from './AccessCodeForm';
import { ErrorActionContainer } from './style';

enum Tab {
  Api = 'api',
  Password = 'password',
}

interface InvalidAccessCodeProps {
  id: string;
  provider?: string;
}

const InvalidAccessCode = memo<InvalidAccessCodeProps>(({ id, provider }) => {
  const { t } = useTranslation('error');
  const [mode, setMode] = useState<Tab>(Tab.Password);

  return (
    <ErrorActionContainer>
      <Segmented
        block
        onChange={(value) => setMode(value as Tab)}
        options={[
          {
            icon: <Icon icon={AsteriskSquare} />,
            label: t('unlock.tabs.password'),
            value: Tab.Password,
          },
          { icon: <Icon icon={KeySquare} />, label: t('unlock.tabs.apiKey'), value: Tab.Api },
        ]}
        style={{ width: '100%' }}
        value={mode}
      />
      <Flexbox gap={24}>
        {mode === Tab.Password && <AccessCodeForm id={id} />}
        {mode === Tab.Api && <APIKeyForm id={id} provider={provider} />}
      </Flexbox>
    </ErrorActionContainer>
  );
});

export default InvalidAccessCode;
