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
import ModelSelect from './ModelSelect';
import SeedNumberInput from './SeedNumberInput';
import SizeSelect from './SizeSelect';
import SizeSliderInput from './SizeSliderInput';
import StepsSliderInput from './StepsSliderInput';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow-y: auto;

    width: 260px;
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

  const configs = (
    [
      {
        label: t('config.model.label'),
        children: <ModelSelect />,
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
