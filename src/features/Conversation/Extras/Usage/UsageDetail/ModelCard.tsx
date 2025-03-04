import { ModelIcon } from '@lobehub/icons';
import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { LobeDefaultAiModelListItem } from '@/types/aiModel';

export const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      font-size: 12px;
    `,
    desc: css`
      color: ${token.colorTextDescription};
      line-height: 12px;
    `,
  };
});

interface ModelCardProps extends LobeDefaultAiModelListItem {
  provider: string;
}

const ModelCard = memo<ModelCardProps>(({ pricing, id, provider }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  console.log(pricing);
  const isShowCredit = useGlobalStore(systemStatusSelectors.isShowCredit);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);

  // const input = [
  //   typeof pricing?.input === 'number' &&
  //     t('messages.modelCard.pricing.inputTokens', {
  //       amount: formatPriceByCurrency(pricing.input, pricing?.currency as ModelPriceCurrency),
  //     }),
  //   typeof pricing?.cachedInput === 'number' &&
  //     t('messages.modelCard.pricing.inputCachedTokens', {
  //       amount: formatPriceByCurrency(pricing.cachedInput, pricing?.currency as ModelPriceCurrency),
  //     }),
  //   typeof pricing?.output === 'number' &&
  //     t('messages.modelCard.pricing.outputTokens', {
  //       amount: formatPriceByCurrency(pricing.output, pricing?.currency as ModelPriceCurrency),
  //     }),
  // ].filter(Boolean) as string[];

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      flex={1}
      gap={40}
      horizontal
      justify={'space-between'}
    >
      <Flexbox align={'center'} gap={8} horizontal>
        <ModelIcon model={id} size={22} />
        <Flexbox flex={1} gap={2} style={{ minWidth: 0 }}>
          <Flexbox align={'center'} gap={8} horizontal style={{ lineHeight: '12px' }}>
            {id}
          </Flexbox>
          <span className={styles.desc}>{provider}</span>
        </Flexbox>
      </Flexbox>
      <Flexbox>
        <Segmented
          onChange={(value) => {
            updateSystemStatus({ isShowCredit: value === 'credit' });
          }}
          options={[
            { label: 'Token', value: 'token' },
            { label: 'Credit', value: 'credit' },
          ]}
          size={'small'}
          value={isShowCredit ? 'credit' : 'token'}
        />
      </Flexbox>
      {/*<Flexbox align={'baseline'} gap={8} horizontal>*/}
      {/*  {input.join(' / ')}*/}
      {/*</Flexbox>*/}
    </Flexbox>
  );
});

export default ModelCard;
