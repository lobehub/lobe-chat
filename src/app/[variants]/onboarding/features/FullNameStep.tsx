'use client';

import { Button, Icon } from '@lobehub/ui';
import { Input, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowLeft, User } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

interface FullNameStepProps {
  onBack: () => Promise<void>;
  onNext: () => Promise<void>;
}

const FullNameStep = memo<FullNameStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const existingFullName = useUserStore(userProfileSelectors.fullName);
  const updateFullName = useUserStore((s) => s.updateFullName);

  const [value, setValue] = useState(existingFullName || '');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (value.trim()) {
        await updateFullName(value.trim());
      }
      await onNext();
    } catch (error) {
      console.error('Failed to update full name:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    setLoading(true);
    try {
      await onBack();
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
          <Icon icon={User} size={32} style={{ color: theme.colorPrimary }} />
        </Flexbox>
        <Typography.Title level={3} style={{ margin: 0, textAlign: 'center' }}>
          {t('username.title')}
        </Typography.Title>
        <Typography.Text style={{ textAlign: 'center' }} type="secondary">
          {t('username.desc')}
        </Typography.Text>
      </Flexbox>

      <Flexbox gap={8}>
        <Input
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleNext}
          placeholder={t('username.placeholder')}
          size="large"
          value={value}
        />
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          {t('username.hint')}
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

FullNameStep.displayName = 'FullNameStep';

export default FullNameStep;
