'use client';

import { SendButton } from '@lobehub/editor/react';
import { Block, Button, Icon, Input, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import {
  BriefcaseIcon,
  ChartNetworkIcon,
  CodeXmlIcon,
  GraduationCapIcon,
  HandCoinsIcon,
  PaintBucketIcon,
  PenIcon,
  PercentIcon,
  TargetIcon,
  TextCursorIcon,
  Undo2Icon,
} from 'lucide-react';
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
  const existingOccupation = useUserStore(userProfileSelectors.occupation);
  const updateOccupation = useUserStore((s) => s.updateOccupation);

  const [type, setType] = useState<string>();
  const [value, setValue] = useState(existingOccupation || '');
  const [loading, setLoading] = useState(false);

  const areas = [
    { icon: PenIcon, key: 'writing', label: t('occupation.area.writing') },
    { icon: CodeXmlIcon, key: 'coding', label: t('occupation.area.coding') },
    { icon: PaintBucketIcon, key: 'design', label: t('occupation.area.design') },
    { icon: GraduationCapIcon, key: 'education', label: t('occupation.area.education') },
    {
      icon: ChartNetworkIcon,
      key: 'business',
      label: t('occupation.area.business'),
    },
    {
      icon: PercentIcon,
      key: 'marketing',
      label: t('occupation.area.marketing'),
    },
    {
      icon: TargetIcon,
      key: 'product',
      label: t('occupation.area.product'),
    },
    { icon: HandCoinsIcon, key: 'sales', label: t('occupation.area.sales') },
    { icon: TextCursorIcon, key: 'other', label: t('occupation.area.other') },
  ];

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
        sentences={[t('occupation.title'), t('occupation.title2'), t('occupation.title3')]}
      />
      <Flexbox align={'center'} gap={12} horizontal wrap={'wrap'}>
        {areas.map((item) => {
          const isActive = type === item.key;
          return (
            <Block
              clickable
              gap={8}
              horizontal
              key={item.key}
              onClick={async () => {
                setType(item.key);
                if (item.key !== 'other') {
                  setValue(item.label);
                  await handleNext();
                }
              }}
              padding={12}
              style={
                isActive
                  ? { background: theme.colorFillSecondary, borderColor: theme.colorFillSecondary }
                  : {}
              }
              variant={'outlined'}
            >
              <Icon color={theme.colorTextSecondary} icon={item.icon} size={16} />
              <Text fontSize={15} weight={500}>
                {item.label}
              </Text>
            </Block>
          );
        })}
      </Flexbox>
      {type === 'other' && (
        <Input
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleNext}
          placeholder={t('occupation.placeholder')}
          prefix={
            <Icon
              color={theme.colorTextDescription}
              icon={BriefcaseIcon}
              style={{
                marginInline: 8,
              }}
            />
          }
          size="large"
          suffix={
            <SendButton disabled={!value} loading={loading} onClick={handleNext} type="primary" />
          }
          title={t('occupation.hint')}
          value={value}
        />
      )}
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

OccupationStep.displayName = 'OccupationStep';

export default OccupationStep;
