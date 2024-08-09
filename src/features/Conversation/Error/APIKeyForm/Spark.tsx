import { Spark } from '@lobehub/icons';
import { Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

import { FormAction } from '../style';

const SparkForm = memo(() => {
  const { t } = useTranslation('modelProvider');

  const [sparkApiKey, sparkApiSecret, setConfig] = useUserStore((s) => [
    keyVaultsConfigSelectors.sparkConfig(s).sparkApiKey,
    keyVaultsConfigSelectors.sparkConfig(s).sparkApiSecret,
    s.updateKeyVaultConfig,
  ]);

  return (
    <FormAction
      avatar={<Spark color={Spark.colorPrimary} size={56} />}
      description={t('spark.unlock.description')}
      title={t('spark.unlock.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Spark, { sparkApiKey: e.target.value });
        }}
        placeholder={t('spark.sparkApiKey.placeholder')}
        type={'block'}
        value={sparkApiKey}
      />
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Spark, { sparkApiSecret: e.target.value });
        }}
        placeholder={t('spark.sparkApiSecret.placeholder')}
        type={'block'}
        value={sparkApiSecret}
      />
    </FormAction>
  );
});

export default SparkForm;
