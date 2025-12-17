'use client';

import { SendButton } from '@lobehub/editor/react';
import { Button, Select, Text } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import { Undo2Icon } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { Locales, localeOptions, normalizeLocale } from '@/locales/resources';
import { useGlobalStore } from '@/store/global';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import LobeMessage from '../components/LobeMessage';

interface ResponseLanguageStepProps {
  onBack: () => Promise<void>;
  onNext: () => Promise<void>;
}

const ResponseLanguageStep = memo<ResponseLanguageStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation(['onboarding', 'common']);
  const theme = useTheme();
  const fullName = useUserStore(userProfileSelectors.fullName);
  const switchLocale = useGlobalStore((s) => s.switchLocale);
  const setSettings = useUserStore((s) => s.setSettings);

  const [value, setValue] = useState<Locales | ''>(normalizeLocale(navigator.language));
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

      await onNext();
    } catch (error) {
      console.error('Failed to save response language:', error);
    } finally {
      setLoading(false);
    }
  };

  const Message = useCallback(
    () => (
      <LobeMessage
        sentences={[
          t('responseLanguage.title', { fullName }),
          t('responseLanguage.title2'),
          t('responseLanguage.title3'),
        ]}
      />
    ),
    [t, value],
  );

  return (
    <Flexbox gap={16}>
      <Message />
      <Flexbox align={'center'} gap={12} horizontal>
        <Select
          onChange={(v) => {
            if (v) {
              switchLocale(v);
              setValue(v);
            }
          }}
          optionRender={(item) => (
            <Flexbox key={item.value}>
              <Text>{item.label}</Text>
              <Text fontSize={12} type={'secondary'}>
                {t(`lang.${item.value}` as any, { ns: 'common' })}
              </Text>
            </Flexbox>
          )}
          options={localeOptions}
          showSearch
          size="large"
          style={{
            fontSize: 28,
            width: '100%',
            zoom: 1.1,
          }}
          value={value}
        />
        <SendButton
          loading={loading}
          onClick={handleNext}
          style={{
            zoom: 1.5,
          }}
          type="primary"
        />
      </Flexbox>
      <Typography.Text style={{ fontSize: 12 }} type="secondary">
        {t('responseLanguage.hint')}
      </Typography.Text>
      <Flexbox horizontal justify={'flex-start'}>
        <Button
          disabled={loading}
          icon={Undo2Icon}
          onClick={handleBack}
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

ResponseLanguageStep.displayName = 'ResponseLanguageStep';

export default ResponseLanguageStep;
