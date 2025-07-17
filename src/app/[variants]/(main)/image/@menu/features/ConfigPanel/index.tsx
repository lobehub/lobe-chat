'use client';

import { Text } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { imageGenerationConfigSelectors } from '@/store/image/selectors';
import { useDimensionControl } from '@/store/image/slices/generationConfig/hooks';
import { useImageStore } from '@/store/image/store';

import DimensionControlGroup from './components/DimensionControlGroup';
import ImageNum from './components/ImageNum';
import ImageUrl from './components/ImageUrl';
import ImageUrlsUpload from './components/ImageUrlsUpload';
import ModelSelect from './components/ModelSelect';
import SeedNumberInput from './components/SeedNumberInput';
import SizeSelect from './components/SizeSelect';
import StepsSliderInput from './components/StepsSliderInput';

interface ConfigItemLayoutProps {
  children: ReactNode;
  label?: string;
}

const ConfigItemLayout = memo<ConfigItemLayoutProps>(({ label, children }) => {
  return (
    <Flexbox gap={8}>
      {label && <Text weight={500}>{label}</Text>}
      {children}
    </Flexbox>
  );
});

const isSupportedParamSelector = imageGenerationConfigSelectors.isSupportedParam;

const ConfigPanel = memo(() => {
  const { t } = useTranslation('image');

  const isSupportImageUrl = useImageStore(isSupportedParamSelector('imageUrl'));
  const isSupportSize = useImageStore(isSupportedParamSelector('size'));
  const isSupportSeed = useImageStore(isSupportedParamSelector('seed'));
  const isSupportSteps = useImageStore(isSupportedParamSelector('steps'));
  const isSupportImageUrls = useImageStore(isSupportedParamSelector('imageUrls'));

  const { showDimensionControl } = useDimensionControl();

  return (
    <Flexbox gap={32} padding={12}>
      <ConfigItemLayout>
        <ModelSelect />
      </ConfigItemLayout>

      {isSupportImageUrl && (
        <ConfigItemLayout label={t('config.imageUrl.label')}>
          <ImageUrl />
        </ConfigItemLayout>
      )}

      {isSupportImageUrls && (
        <ConfigItemLayout label={t('config.imageUrls.label')}>
          <ImageUrlsUpload />
        </ConfigItemLayout>
      )}

      {isSupportSize && (
        <ConfigItemLayout label={t('config.size.label')}>
          <SizeSelect />
        </ConfigItemLayout>
      )}

      {showDimensionControl && <DimensionControlGroup />}

      {isSupportSteps && (
        <ConfigItemLayout label={t('config.steps.label')}>
          <StepsSliderInput />
        </ConfigItemLayout>
      )}

      {isSupportSeed && (
        <ConfigItemLayout label={t('config.seed.label')}>
          <SeedNumberInput />
        </ConfigItemLayout>
      )}

      <ConfigItemLayout label={t('config.imageNum.label')}>
        <ImageNum />
      </ConfigItemLayout>
    </Flexbox>
  );
});

export default ConfigPanel;
