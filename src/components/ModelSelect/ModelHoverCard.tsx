import { ModelIcon } from '@lobehub/icons';
import { Icon, Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowDownToDot, ArrowUpFromDot, BookUp2Icon, CircleFadingArrowUp } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatModelCard } from '@/types/llm';
import { formatPriceByCurrency, formatTokenNumber } from '@/utils/format';
import {
  getAudioInputUnitRate,
  getCachedTextInputUnitRate,
  getTextInputUnitRate,
  getTextOutputUnitRate,
  getWriteCacheInputUnitRate,
} from '@/utils/pricing';

import { ModelInfoTags } from './index';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 280px;
    padding: 16px;
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: 8px;
    box-shadow: ${token.boxShadowTertiary};
  `,
  header: css`
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  title: css`
    font-size: 14px;
    font-weight: 600;
    color: ${token.colorText};
    margin-bottom: 4px;
    line-height: 1.3;
  `,
  provider: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  `,
  infoGrid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
    margin: 12px 0;
  `,
  infoItem: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  infoLabel: css`
    font-size: 10px;
    color: ${token.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  `,
  infoValue: css`
    font-size: 13px;
    color: ${token.colorText};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  pricingGrid: css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 12px;
  `,
  pricingItem: css`
    background: ${token.colorFillQuaternary};
    border-radius: 6px;
    padding: 8px 6px;
    text-align: center;
    border: 1px solid ${token.colorBorder};
  `,
  pricingLabel: css`
    font-size: 9px;
    color: ${token.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
    font-weight: 500;
  `,
  pricingValue: css`
    font-size: 11px;
    color: ${token.colorText};
    font-weight: 600;
    font-family: ${token.fontFamilyCode};
  `,
  abilities: css`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
  description: css`
    font-size: 11px;
    color: ${token.colorTextSecondary};
    line-height: 1.4;
    margin-top: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `,
}));

interface ModelHoverCardProps extends ChatModelCard {
  provider?: string;
}

export const ModelHoverCard = memo<ModelHoverCardProps>(({ provider, ...model }) => {
  const { t } = useTranslation('components');
  const { styles } = useStyles();

  // Format pricing information
  const getPricingData = () => {
    if (!model.pricing) return null;

    const inputRate = getTextInputUnitRate(model.pricing);
    const outputRate = getTextOutputUnitRate(model.pricing);
    const cachedInputRate = getCachedTextInputUnitRate(model.pricing);

    return {
      input: inputRate ? formatPriceByCurrency(inputRate, model.pricing.currency) : null,
      output: outputRate ? formatPriceByCurrency(outputRate, model.pricing.currency) : null,
      cached: cachedInputRate
        ? formatPriceByCurrency(cachedInputRate, model.pricing.currency)
        : null,
    };
  };

  const pricing = getPricingData();

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <Flexbox align="center" gap={8} horizontal>
          <ModelIcon model={model.id} size={20} />
          <Flexbox flex={1}>
            <div className={styles.title}>{model.displayName || model.id}</div>
            {provider && <div className={styles.provider}>{provider}</div>}
          </Flexbox>
        </Flexbox>
      </div>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        {/* Context Window */}
        {typeof model.contextWindowTokens === 'number' && (
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('ModelSelect.contextWindow')}</div>
            <div className={styles.infoValue}>
              {model.contextWindowTokens === 0 ? (
                <span>∞</span>
              ) : (
                formatTokenNumber(model.contextWindowTokens)
              )}
            </div>
          </div>
        )}

        {/* Max Output */}
        {model.maxOutput && (
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('ModelSelect.maxOutput').toUpperCase()}</div>
            <div className={styles.infoValue}>{formatTokenNumber(model.maxOutput)}</div>
          </div>
        )}

        {/* Released Date */}
        {model.releasedAt && (
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('ModelSelect.releasedAt').toUpperCase()}</div>
            <div className={styles.infoValue}>
              {new Date(model.releasedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
              })}
            </div>
          </div>
        )}

        {/* Model Type */}
        {model.type && (
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>{t('ModelSelect.type').toUpperCase()}</div>
            <div className={styles.infoValue}>{model.type.toUpperCase()}</div>
          </div>
        )}
      </div>

      {/* Pricing */}
      {pricing && (pricing.input || pricing.output || pricing.cached) && (
        <div className={styles.pricingGrid}>
          {pricing.input && (
            <div className={styles.pricingItem}>
              <div className={styles.pricingLabel}>INPUT</div>
              <div className={styles.pricingValue}>${pricing.input}</div>
            </div>
          )}
          {pricing.output && (
            <div className={styles.pricingItem}>
              <div className={styles.pricingLabel}>OUTPUT</div>
              <div className={styles.pricingValue}>${pricing.output}</div>
            </div>
          )}
          {pricing.cached && (
            <div className={styles.pricingItem}>
              <div className={styles.pricingLabel}>CACHED</div>
              <div className={styles.pricingValue}>${pricing.cached}</div>
            </div>
          )}
        </div>
      )}

      {/* Abilities */}
      <div className={styles.abilities}>
        <ModelInfoTags {...model} contextWindowTokens={model.contextWindowTokens} />
      </div>

      {/* Description */}
      {model.description && <div className={styles.description}>{model.description}</div>}
    </div>
  );
});

ModelHoverCard.displayName = 'ModelHoverCard';
