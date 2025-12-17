'use client';

import { SendButton } from '@lobehub/editor/react';
import { Block, Button, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Undo2Icon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { useNavigate } from 'react-router-dom';

import LobeMessage from '@/app/[variants]/onboarding/components/LobeMessage';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/slices/auth/selectors';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    transition: all 0.15s ease;

    .next-btn {
      transform: scale(0.4);
      opacity: 0;
      transition: all 0.15s ease;
    }

    &:hover {
      .next-btn {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
  disabled: css`
    transform: scale(1) !important;
    opacity: 1 !important;
  `,
  lite: css`
    &:hover {
      border-inline-end-color: ${token.purple};
      border-inline-end-width: 4px;
    }
  `,
  pro: css`
    &:hover {
      border-inline-end-color: ${token.gold};
      border-inline-end-width: 4px;
    }
  `,
}));

interface ModeSelectionStepProps {
  onBack: () => void;
  onNext: () => void;
}

const ModeSelectionStep = memo<ModeSelectionStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const fullName = useUserStore(userProfileSelectors.fullName);
  const { cx, styles, theme } = useStyles();

  const [updateGeneralConfig, finishOnboarding] = useUserStore((s) => [
    s.updateGeneralConfig,
    s.finishOnboarding,
  ]);

  const [loading, setLoading] = useState<boolean | 'lite' | 'pro'>(false);

  const handleSelectLite = async () => {
    setLoading('lite');
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
    setLoading('pro');
    try {
      await updateGeneralConfig({ isLiteMode: false });
      onNext();
    } catch (error) {
      console.error('Failed to select pro mode:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flexbox>
      <LobeMessage
        sentences={[
          t('modeSelection.title'),
          t('modeSelection.title2'),
          t('modeSelection.title3', { fullName }),
        ]}
      />
      <Text type={'secondary'}>{t('modeSelection.hint')}</Text>
      <Flexbox gap={16} paddingBlock={24}>
        {/* Lite Mode Option */}
        <Block
          className={cx(styles.base, styles.lite)}
          clickable
          onClick={handleSelectLite}
          padding={16}
          variant={'outlined'}
        >
          <Text as={'h2'} fontSize={18} strong>
            {t('modeSelection.lite.title')}
          </Text>
          <Text as={'p'}>{t('modeSelection.lite.subtitle')}</Text>
          <Flexbox
            align={'center'}
            gap={16}
            horizontal
            justify={'space-between'}
            style={{ marginTop: 8 }}
          >
            <Text as={'p'} type={'secondary'}>
              {t('modeSelection.lite.desc')}
            </Text>
            <SendButton
              className={cx('next-btn', loading === 'lite' && styles.disabled)}
              loading={Boolean(loading)}
              type="primary"
            />
          </Flexbox>
        </Block>

        {/* Pro Mode Option */}
        <Block
          className={cx(styles.base, styles.pro)}
          clickable
          onClick={handleSelectPro}
          padding={16}
          variant={'outlined'}
        >
          <Text as={'h2'} fontSize={18} strong>
            {t('modeSelection.pro.title')}
          </Text>
          <Text as={'p'}>{t('modeSelection.pro.subtitle')}</Text>
          <Flexbox
            align={'center'}
            gap={16}
            horizontal
            justify={'space-between'}
            style={{ marginTop: 8 }}
          >
            <Text as={'p'} type={'secondary'}>
              {t('modeSelection.pro.desc')}
            </Text>
            <SendButton
              className={cx('next-btn', loading === 'pro' && styles.disabled)}
              loading={Boolean(loading)}
              type="primary"
            />
          </Flexbox>
        </Block>
      </Flexbox>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
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
      </Flexbox>
    </Flexbox>
  );
});

ModeSelectionStep.displayName = 'ModeSelectionStep';

export default ModeSelectionStep;
