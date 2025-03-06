import { Icon } from '@lobehub/ui';
import { Divider, Popover } from 'antd';
import { useTheme } from 'antd-style';
import { BadgeCent, CoinsIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { ModelTokensUsage } from '@/types/message';
import { formatNumber } from '@/utils/format';

import ModelCard from './ModelCard';
import TokenProgress, { TokenProgressItem } from './TokenProgress';
import { getDetailsToken } from './tokens';

interface TokenDetailProps {
  model: string;
  provider: string;
  usage: ModelTokensUsage;
}

const TokenDetail = memo<TokenDetailProps>(({ usage, model, provider }) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const modelCard = useAiInfraStore(aiModelSelectors.getModelCard(model, provider));
  const isShowCredit = useGlobalStore(systemStatusSelectors.isShowCredit) && !!modelCard?.pricing;

  const detailTokens = getDetailsToken(usage, modelCard);
  const inputDetails = [
    !!detailTokens.inputAudio && {
      color: theme.cyan9,
      id: 'reasoning',
      title: t('messages.tokenDetails.inputAudio'),
      value: isShowCredit ? detailTokens.inputAudio.credit : detailTokens.inputAudio.token,
    },
    !!detailTokens.inputCitation && {
      color: theme.orange,
      id: 'inputText',
      title: t('messages.tokenDetails.inputCitation'),
      value: isShowCredit ? detailTokens.inputCitation.credit : detailTokens.inputCitation.token,
    },
    !!detailTokens.inputText && {
      color: theme.green,
      id: 'inputText',
      title: t('messages.tokenDetails.inputText'),
      value: isShowCredit ? detailTokens.inputText.credit : detailTokens.inputText.token,
    },
  ].filter(Boolean) as TokenProgressItem[];

  const outputDetails = [
    !!detailTokens.outputReasoning && {
      color: theme.pink,
      id: 'reasoning',
      title: t('messages.tokenDetails.reasoning'),
      value: isShowCredit
        ? detailTokens.outputReasoning.credit
        : detailTokens.outputReasoning.token,
    },
    !!detailTokens.outputAudio && {
      color: theme.cyan9,
      id: 'outputAudio',
      title: t('messages.tokenDetails.outputAudio'),
      value: isShowCredit ? detailTokens.outputAudio.credit : detailTokens.outputAudio.token,
    },
    !!detailTokens.outputText && {
      color: theme.green,
      id: 'outputText',
      title: t('messages.tokenDetails.outputText'),
      value: isShowCredit ? detailTokens.outputText.credit : detailTokens.outputText.token,
    },
  ].filter(Boolean) as TokenProgressItem[];

  const totalDetail = [
    !!detailTokens.inputCacheMiss && {
      color: theme.colorFill,

      id: 'uncachedInput',
      title: t('messages.tokenDetails.inputUncached'),
      value: isShowCredit ? detailTokens.inputCacheMiss.credit : detailTokens.inputCacheMiss.token,
    },
    !!detailTokens.inputCached && {
      color: theme.orange,
      id: 'inputCached',
      title: t('messages.tokenDetails.inputCached'),
      value: isShowCredit ? detailTokens.inputCached.credit : detailTokens.inputCached.token,
    },
    !!detailTokens.totalOutput && {
      color: theme.colorSuccess,
      id: 'output',
      title: t('messages.tokenDetails.output'),
      value: isShowCredit ? detailTokens.totalOutput.credit : detailTokens.totalOutput.token,
    },
  ].filter(Boolean) as TokenProgressItem[];

  const displayTotal =
    isShowCredit && !!detailTokens.totalTokens
      ? formatNumber(detailTokens.totalTokens.credit)
      : formatNumber(detailTokens.totalTokens!.token);

  const averagePricing = formatNumber(
    detailTokens.totalTokens!.credit / detailTokens.totalTokens!.token,
    2,
  );
  return (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={8} style={{ minWidth: 200 }}>
          {modelCard && <ModelCard {...modelCard} provider={provider} />}

          <Flexbox gap={20}>
            {inputDetails.length > 1 && (
              <Flexbox gap={4}>
                <Flexbox
                  align={'center'}
                  gap={4}
                  horizontal
                  justify={'space-between'}
                  width={'100%'}
                >
                  <div style={{ color: theme.colorTextDescription, fontSize: 12 }}>
                    {t('messages.tokenDetails.inputTitle')}
                  </div>
                </Flexbox>
                <TokenProgress data={inputDetails} showIcon />
              </Flexbox>
            )}
            {outputDetails.length > 1 && (
              <>
                <Flexbox
                  align={'center'}
                  gap={4}
                  horizontal
                  justify={'space-between'}
                  width={'100%'}
                >
                  <div style={{ color: theme.colorTextDescription }}>
                    {t('messages.tokenDetails.outputTitle')}
                  </div>
                </Flexbox>
                <TokenProgress data={outputDetails} showIcon />
              </>
            )}
            <Flexbox>
              <TokenProgress data={totalDetail} showIcon />
              <Divider style={{ marginBlock: 8 }} />
              <Flexbox align={'center'} gap={4} horizontal justify={'space-between'}>
                <div style={{ color: theme.colorTextSecondary }}>
                  {t('messages.tokenDetails.total')}
                </div>
                <div style={{ fontWeight: 500 }}>{displayTotal}</div>
              </Flexbox>
              {isShowCredit && (
                <Flexbox align={'center'} gap={4} horizontal justify={'space-between'}>
                  <div style={{ color: theme.colorTextSecondary }}>
                    {t('messages.tokenDetails.average')}
                  </div>
                  <div style={{ fontWeight: 500 }}>{averagePricing}</div>
                </Flexbox>
              )}
            </Flexbox>
          </Flexbox>
        </Flexbox>
      }
      placement={'top'}
      trigger={['hover', 'click']}
    >
      <Center gap={2} horizontal style={{ cursor: 'default' }}>
        <Icon icon={isShowCredit ? BadgeCent : CoinsIcon} />
        {displayTotal}
      </Center>
    </Popover>
  );
});

export default TokenDetail;
