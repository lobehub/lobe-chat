'use client';

import { Form, FormItemProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUpdateActiveModelEffect } from '@/store/image/slices/generationConfig/hooks';
import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { useImageStore } from '@/store/image/store';

import AspectRatioSelect from './AspectRatioSelect';
import ImageNum from './ImageNum';
import ImageUrlsUpload from './ImageUrlsUpload';
import ModelSelect from './ModelSelect';
import SeedNumberInput from './SeedNumberInput';
import SizeSelect from './SizeSelect';
import SizeSliderInput from './SizeSliderInput';
import StepsSliderInput from './StepsSliderInput';
import { CONFIG_PANEL_WIDTH } from './constants';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow-y: auto;
    flex-shrink: 0;

    width: ${CONFIG_PANEL_WIDTH}px;
    height: 100%;
    padding: 16px;
    border-inline-start: 1px solid ${token.colorBorderSecondary};
  `,
}));
const isSupportParamSelector = imageGenerationConfigSelectors.isSupportParam;

const ConfigPanel = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('image');

  useUpdateActiveModelEffect();

  const isSupportWidth = useImageStore(isSupportParamSelector('width'));
  const isSupportHeight = useImageStore(isSupportParamSelector('height'));
  const isSupportSize = useImageStore(isSupportParamSelector('size'));
  const isSupportAspectRatio = useImageStore(isSupportParamSelector('aspectRatio'));
  const isSupportSeed = useImageStore(isSupportParamSelector('seed'));
  const isSupportSteps = useImageStore(isSupportParamSelector('steps'));
  const isSupportImageUrls = useImageStore(isSupportParamSelector('imageUrls'));

  const configs = (
    [
      {
        label: t('config.model.label'),
        children: <ModelSelect />,
      },
      isSupportImageUrls && {
        label: t('config.imageUrls.label'),
        children: <ImageUrlsUpload />,
      },
      isSupportSize && {
        label: t('config.size.label'),
        children: <SizeSelect />,
      },
      isSupportAspectRatio && {
        label: t('config.aspectRatio.label'),
        children: <AspectRatioSelect />,
      },
      isSupportWidth && {
        label: t('config.width.label'),
        children: <SizeSliderInput paramName="width" />,
      },
      isSupportHeight && {
        label: t('config.height.label'),
        children: <SizeSliderInput paramName="height" />,
      },
      isSupportSteps && {
        label: t('config.steps.label'),
        children: <StepsSliderInput />,
      },
      isSupportSeed && {
        label: t('config.seed.label'),
        children: <SeedNumberInput />,
      },
      {
        label: t('config.imageNum.label'),
        children: <ImageNum />,
      },
    ] satisfies Array<Partial<FormItemProps> | boolean>
  )
    .filter(Boolean)
    .map((item) => ({ ...item, layout: 'vertical' as const }));

  return (
    <aside className={styles.container}>
      <Form
        items={[
          {
            children: configs,
            title: t('config.title'),
          },
        ]}
        itemsType={'group'}
        variant={'borderless'}
        {...FORM_STYLE}
      />
    </aside>
  );
});

export default ConfigPanel;
