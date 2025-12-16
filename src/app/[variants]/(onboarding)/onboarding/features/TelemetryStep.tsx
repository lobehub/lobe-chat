'use client';

import { Button, Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import { BarChart3, ShieldCheck } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';
import { useUserStore } from '@/store/user';

interface TelemetryStepProps {
  onNext: () => Promise<void>;
}

const TelemetryStep = memo<TelemetryStepProps>(({ onNext }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);
  const [loading, setLoading] = useState(false);

  const handleChoice = async (enabled: boolean) => {
    setLoading(true);
    try {
      await updateGeneralConfig({ telemetry: enabled });
      await onNext();
    } catch (error) {
      console.error('Failed to update telemetry config:', error);
    } finally {
      setLoading(false);
    }
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
          <Icon icon={BarChart3} size={32} style={{ color: theme.colorPrimary }} />
        </Flexbox>
        <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          {t('telemetry.title')}
        </Typography.Title>
        <Typography.Text style={{ textAlign: 'center' }} type="secondary">
          {t('telemetry.desc', { appName: BRANDING_NAME })}
        </Typography.Text>
      </Flexbox>

      <Flexbox gap={12}>
        <Flexbox
          align="flex-start"
          gap={12}
          horizontal
          style={{
            background: theme.colorFillQuaternary,
            borderRadius: theme.borderRadius,
            padding: 16,
          }}
        >
          <Icon icon={ShieldCheck} size={20} style={{ color: theme.colorSuccess, flexShrink: 0 }} />
          <Typography.Text type="secondary">{t('telemetry.privacy')}</Typography.Text>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={12}>
        <Button block loading={loading} onClick={() => handleChoice(true)} type="primary">
          {t('telemetry.enable')}
        </Button>
        <Button block disabled={loading} onClick={() => handleChoice(false)}>
          {t('telemetry.disable')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

TelemetryStep.displayName = 'TelemetryStep';

export default TelemetryStep;
