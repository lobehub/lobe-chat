'use client';

import { SendButton } from '@lobehub/editor/react';
import { Button, Icon, Input } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { SignatureIcon, Undo2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import LobeMessage from '../components/LobeMessage';

interface FullNameStepProps {
  onBack: () => void;
  onNext: () => void;
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
      onNext();
    } catch (error) {
      console.error('Failed to update full name:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flexbox gap={16}>
      <LobeMessage sentences={[t('username.title'), t('username.title2'), t('username.title3')]} />
      <Flexbox align={'center'} gap={12} horizontal>
        <Input
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleNext}
          placeholder={t('username.placeholder')}
          prefix={
            <Icon
              color={theme.colorTextDescription}
              icon={SignatureIcon}
              size={32}
              style={{
                marginInline: 8,
              }}
            />
          }
          size="large"
          styles={{
            input: {
              fontSize: 28,
              fontWeight: 'bolder',
            },
          }}
          suffix={
            <SendButton
              disabled={!value?.trim()}
              loading={loading}
              onClick={handleNext}
              style={{
                zoom: 1.5,
              }}
              type="primary"
            />
          }
          title={t('username.hint')}
          value={value}
        />
      </Flexbox>
      <Flexbox horizontal justify={'flex-start'} style={{ marginTop: 32 }}>
        <Button
          disabled={loading}
          icon={Undo2Icon}
          onClick={onBack}
          style={{
            color: theme.colorTextDescription,
          }}
          type={'text'}
        >
          {t('back')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

FullNameStep.displayName = 'FullNameStep';

export default FullNameStep;
