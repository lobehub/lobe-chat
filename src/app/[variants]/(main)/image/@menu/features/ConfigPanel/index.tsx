'use client';

import { Text } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { imageGenerationConfigSelectors } from '@/store/image/selectors';
import { useImageStore } from '@/store/image/store';

import AspectRatioSelect from './components/AspectRatioSelect';
import ImageNum from './components/ImageNum';
import ImageUrl from './components/ImageUrl';
import ImageUrlsUpload from './components/ImageUrlsUpload';
import ModelSelect from './components/ModelSelect';
import SeedNumberInput from './components/SeedNumberInput';
import SizeSelect from './components/SizeSelect';
import SizeSliderInput from './components/SizeSliderInput';
import StepsSliderInput from './components/StepsSliderInput';

interface ConfigItemLayoutProps {
  label?: string;
  children: ReactNode;
}

const ConfigItemLayout = memo<ConfigItemLayoutProps>(({ label, children }) => {
  return (
    <Flexbox gap={8}>
      {label && <Text weight={500}>{label.toUpperCase()}</Text>}
      {children}
    </Flexbox>
  );
});

const isSupportParamSelector = imageGenerationConfigSelectors.isSupportParam;

const ConfigPanel = memo(() => {
  const { t } = useTranslation('image');

  const isSupportImageUrl = useImageStore(isSupportParamSelector('imageUrl'));
  const isSupportWidth = useImageStore(isSupportParamSelector('width'));
  const isSupportHeight = useImageStore(isSupportParamSelector('height'));
  const isSupportSize = useImageStore(isSupportParamSelector('size'));
  const isSupportAspectRatio = useImageStore(isSupportParamSelector('aspectRatio'));
  const isSupportSeed = useImageStore(isSupportParamSelector('seed'));
  const isSupportSteps = useImageStore(isSupportParamSelector('steps'));
  const isSupportImageUrls = useImageStore(isSupportParamSelector('imageUrls'));

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

      {isSupportAspectRatio && (
        <ConfigItemLayout label={t('config.aspectRatio.label')}>
          <AspectRatioSelect />
        </ConfigItemLayout>
      )}

      {isSupportWidth && (
        <ConfigItemLayout label={t('config.width.label')}>
          <SizeSliderInput paramName="width" />
        </ConfigItemLayout>
      )}

      {isSupportHeight && (
        <ConfigItemLayout label={t('config.height.label')}>
          <SizeSliderInput paramName="height" />
        </ConfigItemLayout>
      )}

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
