'use client';

import { Button, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Undo2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import LobeMessage from '@/app/[variants]/onboarding/components/LobeMessage';
import ModelSelect from '@/features/ModelSelect';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import KlavisServerList from '../components/KlavisServerList';

interface ProSettingsStepProps {
  onBack: () => void;
}

const ProSettingsStep = memo<ProSettingsStepProps>(({ onBack }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const navigate = useNavigate();

  const enableKlavis = useServerConfigStore(serverConfigSelectors.enableKlavis);

  const [updateDefaultModel, finishOnboarding] = useUserStore((s) => [
    s.updateDefaultModel,
    s.finishOnboarding,
  ]);

  const defaultAgentConfig = useUserStore(
    (s) => settingsSelectors.currentSettings(s).defaultAgent?.config,
  );

  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await finishOnboarding();
      navigate('/');
    } catch (error) {
      console.error('Failed to finish onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async ({ model, provider }: { model: string; provider: string }) => {
    await updateDefaultModel(model, provider);
  };

  return (
    <Flexbox gap={16}>
      <LobeMessage
        sentences={[t('proSettings.title'), t('proSettings.title2'), t('proSettings.title3')]}
      />
      {/* Default Model Section */}
      <Flexbox gap={16}>
        <Text color={theme.colorTextSecondary}>{t('proSettings.model.title')}</Text>
        <ModelSelect
          onChange={handleModelChange}
          showAbility={false}
          size="large"
          style={{ width: '100%' }}
          value={defaultAgentConfig}
        />
      </Flexbox>

      {/* Connectors Section (only show if Klavis is enabled) */}
      {enableKlavis && (
        <Flexbox gap={16}>
          <Text color={theme.colorTextSecondary}>{t('proSettings.connectors.title')}</Text>
          <KlavisServerList />
        </Flexbox>
      )}

      <Flexbox align={'center'} horizontal justify={'space-between'} style={{ marginTop: 16 }}>
        <Button
          disabled={Boolean(loading)}
          icon={Undo2Icon}
          onClick={onBack}
          style={{
            color: theme.colorTextDescription,
          }}
          type={'text'}
        >
          {t('back')}
        </Button>
        <Button loading={loading} onClick={handleFinish} style={{ minWidth: 120 }} type="primary">
          {t('finish')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

ProSettingsStep.displayName = 'ProSettingsStep';

export default ProSettingsStep;
