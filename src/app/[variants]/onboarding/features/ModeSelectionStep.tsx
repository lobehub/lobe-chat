'use client';

import { Button, Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '@/store/user';

interface ModeSelectionStepProps {
  onBack: () => Promise<void>;
  onNext: () => Promise<void>;
}

const ModeSelectionStep = memo<ModeSelectionStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const navigate = useNavigate();

  const [updateGeneralConfig, finishOnboarding] = useUserStore((s) => [
    s.updateGeneralConfig,
    s.finishOnboarding,
  ]);

  const [loading, setLoading] = useState(false);

  const handleBack = async () => {
    setLoading(true);
    try {
      await onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLite = async () => {
    setLoading(true);
    try {
      await updateGeneralConfig({ isLiteMode: true });
      await finishOnboarding();
      navigate('/');
    } catch (error) {
      console.error('Failed to select lite mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPro = async () => {
    setLoading(true);
    try {
      await updateGeneralConfig({ isLiteMode: false });
      await onNext();
    } catch (error) {
      console.error('Failed to select pro mode:', error);
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
          <Icon icon={Sparkles} size={32} style={{ color: theme.colorPrimary }} />
        </Flexbox>
        <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          {t('modeSelection.title')}
        </Typography.Title>
        <Typography.Text style={{ textAlign: 'center' }} type="secondary">
          {t('modeSelection.desc')}
        </Typography.Text>
      </Flexbox>

      <Flexbox gap={16}>
        {/* Lite Mode Option */}
        <Flexbox
          gap={12}
          onClick={handleSelectLite}
          style={{
            background: theme.colorFillQuaternary,
            borderRadius: theme.borderRadiusLG,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            padding: 20,
            transition: 'all 0.2s',
          }}
        >
          <Flexbox align="center" gap={12} horizontal>
            <Icon icon={Zap} size={24} style={{ color: theme.colorSuccess }} />
            <Typography.Text strong style={{ fontSize: 16 }}>
              {t('modeSelection.lite.title')}
            </Typography.Text>
          </Flexbox>
          <Typography.Text type="secondary">{t('modeSelection.lite.desc')}</Typography.Text>
        </Flexbox>

        {/* Pro Mode Option */}
        <Flexbox
          gap={12}
          onClick={handleSelectPro}
          style={{
            background: theme.colorFillQuaternary,
            borderRadius: theme.borderRadiusLG,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            padding: 20,
            transition: 'all 0.2s',
          }}
        >
          <Flexbox align="center" gap={12} horizontal>
            <Icon icon={Sparkles} size={24} style={{ color: theme.colorPrimary }} />
            <Typography.Text strong style={{ fontSize: 16 }}>
              {t('modeSelection.pro.title')}
            </Typography.Text>
          </Flexbox>
          <Typography.Text type="secondary">{t('modeSelection.pro.desc')}</Typography.Text>
        </Flexbox>
      </Flexbox>

      <Flexbox>
        <Button
          disabled={loading}
          icon={<Icon icon={ArrowLeft} />}
          onClick={handleBack}
          style={{ alignSelf: 'flex-start' }}
        />
      </Flexbox>
    </Flexbox>
  );
});

ModeSelectionStep.displayName = 'ModeSelectionStep';

export default ModeSelectionStep;
