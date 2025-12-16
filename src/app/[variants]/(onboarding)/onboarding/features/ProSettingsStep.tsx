'use client';

import { Button, Icon } from '@lobehub/ui';
import { Switch, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelSelect from '@/features/ModelSelect';
import { serverConfigSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import KlavisServerList from './KlavisServerList';

interface ProSettingsStepProps {
  onBack: () => Promise<void>;
}

const ProSettingsStep = memo<ProSettingsStepProps>(({ onBack }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const router = useRouter();

  const enableKlavis = useServerConfigStore(serverConfigSelectors.enableKlavis);

  const [updateDefaultModel, updateGeneralConfig, finishOnboarding] = useUserStore((s) => [
    s.updateDefaultModel,
    s.updateGeneralConfig,
    s.finishOnboarding,
  ]);

  const defaultAgentConfig = useUserStore(
    (s) => settingsSelectors.currentSettings(s).defaultAgent?.config,
  );
  const isDevMode = useUserStore(
    (s) => settingsSelectors.currentSettings(s).general?.isDevMode ?? false,
  );

  const [loading, setLoading] = useState(false);

  const handleBack = async () => {
    setLoading(true);
    try {
      await onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await finishOnboarding();
      router.push('/chat');
    } catch (error) {
      console.error('Failed to finish onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = async ({ model, provider }: { model: string; provider: string }) => {
    await updateDefaultModel(model, provider);
  };

  const handleDevModeChange = async (checked: boolean) => {
    await updateGeneralConfig({ isDevMode: checked });
  };

  return (
    <Flexbox gap={32}>
      <Flexbox align="center" gap={16}>
        <Flexbox
          align="center"
          justify="center"
          style={{
            background: theme.colorPrimaryBg,
            borderRadius: theme.borderRadiusLG,
            height: 64,
            width: 64,
          }}
        >
          <Icon icon={Settings2} size={32} style={{ color: theme.colorPrimary }} />
        </Flexbox>
        <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          {t('proSettings.title')}
        </Typography.Title>
        <Typography.Text style={{ textAlign: 'center' }} type="secondary">
          {t('proSettings.desc')}
        </Typography.Text>
      </Flexbox>

      <Flexbox gap={24}>
        {/* Default Model Section */}
        <Flexbox gap={8}>
          <Typography.Text strong>{t('proSettings.model.title')}</Typography.Text>
          <Typography.Text style={{ fontSize: 12 }} type="secondary">
            {t('proSettings.model.desc')}
          </Typography.Text>
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
          <Flexbox gap={8}>
            <Typography.Text strong>{t('proSettings.connectors.title')}</Typography.Text>
            <Typography.Text style={{ fontSize: 12 }} type="secondary">
              {t('proSettings.connectors.desc')}
            </Typography.Text>
            <KlavisServerList />
          </Flexbox>
        )}

        {/* Developer Mode Section */}
        <Flexbox
          align="center"
          gap={12}
          horizontal
          justify="space-between"
          style={{
            background: theme.colorFillQuaternary,
            borderRadius: theme.borderRadius,
            padding: 16,
          }}
        >
          <Flexbox gap={4}>
            <Typography.Text strong>{t('proSettings.devMode.title')}</Typography.Text>
            <Typography.Text style={{ fontSize: 12 }} type="secondary">
              {t('proSettings.devMode.desc')}
            </Typography.Text>
          </Flexbox>
          <Switch checked={isDevMode} onChange={handleDevModeChange} />
        </Flexbox>
      </Flexbox>

      <Flexbox gap={12} horizontal>
        <Button
          disabled={loading}
          icon={<Icon icon={ArrowLeft} />}
          onClick={handleBack}
          style={{ flex: 'none' }}
        />
        <Button block loading={loading} onClick={handleFinish} type="primary">
          {t('finish')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

ProSettingsStep.displayName = 'ProSettingsStep';

export default ProSettingsStep;
