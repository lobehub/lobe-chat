'use client';

import { Button, Icon, Select } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowLeft, Languages } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { Locales, localeOptions } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';

interface ResponseLanguageStepProps {
  onBack: () => Promise<void>;
  onNext: () => Promise<void>;
}

const ResponseLanguageStep = memo<ResponseLanguageStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();

  const currentLanguage = useGlobalStore(systemStatusSelectors.language);
  const switchLocale = useGlobalStore((s) => s.switchLocale);
  const setSettings = useUserStore((s) => s.setSettings);

  const [value, setValue] = useState<Locales | ''>(
    currentLanguage === 'auto' ? '' : currentLanguage,
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

  const handleNext = async () => {
    setLoading(true);

    try {
      // Save response language to settings
      await setSettings({ general: { responseLanguage: value || '' } });

      // If user selected a specific language, also sync the UI language
      if (value) {
        switchLocale(value);
      }

      await onNext();
    } catch (error) {
      console.error('Failed to save response language:', error);
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
          <Icon icon={Languages} size={32} style={{ color: theme.colorPrimary }} />
        </Flexbox>
        <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          {t('responseLanguage.title')}
        </Typography.Title>
        <Typography.Text style={{ textAlign: 'center' }} type="secondary">
          {t('responseLanguage.desc')}
        </Typography.Text>
      </Flexbox>

      <Flexbox gap={8}>
        <Select
          onChange={setValue}
          options={[{ label: t('responseLanguage.auto'), value: '' }, ...localeOptions]}
          size="large"
          style={{ width: '100%' }}
          value={value}
        />
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          {t('responseLanguage.hint')}
        </Typography.Text>
      </Flexbox>

      <Flexbox gap={12} horizontal>
        <Button
          disabled={loading}
          icon={<Icon icon={ArrowLeft} />}
          onClick={handleBack}
          style={{ flex: 'none' }}
        />
        <Button block loading={loading} onClick={handleNext} type="primary">
          {t('next')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

ResponseLanguageStep.displayName = 'ResponseLanguageStep';

export default ResponseLanguageStep;
