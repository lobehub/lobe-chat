import { SenseNova } from '@lobehub/icons';
import { Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

import { FormAction } from '../style';

const SenseNovaForm = memo(() => {
  const { t } = useTranslation('modelProvider');

  const [sensenovaAccessKeyID, sensenovaAccessKeySecret, setConfig] = useUserStore((s) => [
    keyVaultsConfigSelectors.sensenovaConfig(s).sensenovaAccessKeyID,
    keyVaultsConfigSelectors.sensenovaConfig(s).sensenovaAccessKeySecret,
    s.updateKeyVaultConfig,
  ]);

  return (
    <FormAction
      avatar={<SenseNova color={SenseNova.colorPrimary} size={56} />}
      description={t('sensenova.unlock.description')}
      title={t('sensenova.unlock.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.SenseNova, { sensenovaAccessKeyID: e.target.value });
        }}
        placeholder={t('sensenova.sensenovaAccessKeyID.placeholder')}
        type={'block'}
        value={sensenovaAccessKeyID}
      />
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.SenseNova, { sensenovaAccessKeySecret: e.target.value });
        }}
        placeholder={t('sensenova.sensenovaAccessKeySecret.placeholder')}
        type={'block'}
        value={sensenovaAccessKeySecret}
      />
    </FormAction>
  );
});

export default SenseNovaForm;
