import { Icon, Tooltip } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideEye, ToyBrick } from 'lucide-react';
import numeral from 'numeral';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelIcon from '@/components/ModelIcons';
import ModelProviderIcon from '@/components/ModelProviderIcons';
import { ChatModelCard } from '@/types/llm';

const useStyles = createStyles(({ css, token }) => ({
  tag: css`
    cursor: default;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px;
    height: 20px;

    border-radius: 4px;
  `,
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
  token: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 20px;
    padding: 0 4px;

    font-family: ${token.fontFamilyCode};
    font-size: 11px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
    border-radius: 4px;
  `,
}));

interface ModelItemRenderProps extends ChatModelCard {
  showInfoTag?: boolean;
}
export const ModelItemRender = memo<ModelItemRenderProps>(({ showInfoTag = true, ...model }) => {
  const { styles, cx } = useStyles();
  const { t } = useTranslation('common');

  return (
    <Flexbox align={'center'} gap={32} horizontal justify={'space-between'}>
      <Flexbox align={'center'} gap={8} horizontal>
        <ModelIcon model={model.id} size={20} />
        {model.displayName || model.id}
      </Flexbox>

      {showInfoTag && (
        <Flexbox gap={4} horizontal>
          {model.vision && (
            <Tooltip placement={'right'} title={t('ModelSelect.featureTag.vision')}>
              <div className={cx(styles.tag, styles.tagGreen)}>
                <Icon icon={LucideEye} />
              </div>
            </Tooltip>
          )}
          {model.functionCall && (
            <Tooltip
              overlayStyle={{ maxWidth: 'unset' }}
              placement={'right'}
              title={t('ModelSelect.featureTag.functionCall')}
            >
              <div className={cx(styles.tag, styles.tagBlue)}>
                <Icon icon={ToyBrick} />
              </div>
            </Tooltip>
          )}

          {model.tokens && (
            <Tooltip
              overlayStyle={{ maxWidth: 'unset' }}
              placement={'right'}
              title={t('ModelSelect.featureTag.tokens', {
                tokens: numeral(model.tokens).format('0,0'),
              })}
            >
              <div className={styles.token}>{Math.floor(model.tokens / 1000)}K</div>
            </Tooltip>
          )}
        </Flexbox>
      )}
    </Flexbox>
  );
});

interface ProviderItemRenderProps {
  provider: string;
}

export const ProviderItemRender = memo<ProviderItemRenderProps>(({ provider }) => {
  const { t } = useTranslation('common');

  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <ModelProviderIcon provider={provider} />
      {t(`modelProvider.${provider}` as any)}
    </Flexbox>
  );
});
