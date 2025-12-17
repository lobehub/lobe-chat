'use client';

import { SendButton } from '@lobehub/editor/react';
import { Button, Icon, Input } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { BriefcaseIcon, Undo2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import LobeMessage from '../components/LobeMessage';

interface OccupationStepProps {
  onBack: () => void;
  onNext: () => void;
}

const OccupationStep = memo<OccupationStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');
  const theme = useTheme();
  const fullName = useUserStore(userProfileSelectors.fullName);
  const existingOccupation = useUserStore(userProfileSelectors.occupation);
  const updateOccupation = useUserStore((s) => s.updateOccupation);

  const [value, setValue] = useState(existingOccupation || '');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (value.trim()) {
        await updateOccupation(value.trim());
      }
      onNext();
    } catch (error) {
      console.error('Failed to update occupation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flexbox gap={16}>
      <LobeMessage
        sentences={[
          t('occupation.title', { fullName }),
          t('occupation.title2'),
          t('occupation.title3'),
        ]}
      />
      <Flexbox align={'center'} gap={12} horizontal>
        <Input
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleNext}
          placeholder={t('occupation.placeholder')}
          prefix={
            <Icon
              color={theme.colorTextDescription}
              icon={BriefcaseIcon}
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
              loading={loading}
              onClick={handleNext}
              style={{
                zoom: 1.5,
              }}
              type="primary"
            />
          }
          title={t('occupation.hint')}
          value={value}
        />
      </Flexbox>
      <Flexbox horizontal justify={'flex-start'}>
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

OccupationStep.displayName = 'OccupationStep';

export default OccupationStep;
