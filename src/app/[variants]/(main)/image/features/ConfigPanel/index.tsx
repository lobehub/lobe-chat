'use client';

import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { imageGenerationConfigSelectors } from '@/store/image/slices/generationConfig/selectors';
import { useImageStore } from '@/store/image/store';

import AspectRatioSelect from './AspectRatioSelect';
import ImageNum from './ImageNum';
import ImageUrl from './ImageUrl';
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
    padding-block-start: ${token.paddingXL}px;
    border-inline-start: 1px solid ${token.colorBorderSecondary};
  `,
  configItem: css`
    margin-block-end: 24px;

    &:last-child {
      margin-block-end: 0;
    }
  `,
  label: css`
    margin-block-end: 8px;

    font-size: ${token.fontSize}px;
    font-weight: ${token.fontWeightStrong};
    line-height: ${token.lineHeight};
    color: ${token.colorText};
  `,
}));

interface ConfigItemLayoutProps {
  label: string;
  children: ReactNode;
}

const ConfigItemLayout = memo<ConfigItemLayoutProps>(({ label, children }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.configItem}>
      <div className={styles.label}>{label}</div>
      <div>{children}</div>
    </div>
  );
});

const isSupportParamSelector = imageGenerationConfigSelectors.isSupportParam;

const ConfigPanel = memo(() => {
  const { styles } = useStyles();
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
    <aside className={styles.container}>
      <Flexbox gap={0}>
        <ConfigItemLayout label={t('config.model.label')}>
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
    </aside>
  );
});

export default ConfigPanel;
