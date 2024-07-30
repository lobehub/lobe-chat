import { Icon, Tooltip } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Infinity, LucideEye, LucidePaperclip, ToyBrick } from 'lucide-react';
import numeral from 'numeral';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ChatModelCard } from '@/types/llm';

import ModelIcon from '../ModelIcon';
import ModelProviderIcon from '../ModelProviderIcon';

const useStyles = createStyles(({ css, token }) => ({
  custom: css`
    width: 36px;
    height: 20px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${rgba(token.colorWarning, 0.75)};

    background: ${token.colorWarningBg};
    border-radius: 4px;
  `,
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
    width: 36px;
    height: 20px;

    font-family: ${token.fontFamilyCode};
    font-size: 11px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
    border-radius: 4px;
  `,
}));
const formatTokenNumber = (num: number): string => {
  if (num > 0 && num < 1024) return '1K';

  let kiloToken = Math.floor(num / 1024);
  if (num >= 128_000 && num < 1_024_000) {
    kiloToken = Math.floor(num / 1000);
  }
  return kiloToken < 1000 ? `${kiloToken}K` : `${Math.floor(kiloToken / 1000)}M`;
};

interface ModelInfoTagsProps extends ChatModelCard {
  directionReverse?: boolean;
  placement?: 'top' | 'right';
}

export const ModelInfoTags = memo<ModelInfoTagsProps>(
  ({ directionReverse, placement = 'right', ...model }) => {
    const { t } = useTranslation('components');
    const { styles, cx } = useStyles();

    return (
      <Flexbox direction={directionReverse ? 'horizontal-reverse' : 'horizontal'} gap={4}>
        {model.files && (
          <Tooltip
            overlayStyle={{ pointerEvents: 'none' }}
            placement={placement}
            title={t('ModelSelect.featureTag.file')}
          >
            <div className={cx(styles.tag, styles.tagGreen)} style={{ cursor: 'pointer' }} title="">
              <Icon icon={LucidePaperclip} />
            </div>
          </Tooltip>
        )}
        {model.vision && (
          <Tooltip
            overlayStyle={{ pointerEvents: 'none' }}
            placement={placement}
            title={t('ModelSelect.featureTag.vision')}
          >
            <div className={cx(styles.tag, styles.tagGreen)} style={{ cursor: 'pointer' }} title="">
              <Icon icon={LucideEye} />
            </div>
          </Tooltip>
        )}
        {model.functionCall && (
          <Tooltip
            overlayStyle={{ maxWidth: 'unset', pointerEvents: 'none' }}
            placement={placement}
            title={t('ModelSelect.featureTag.functionCall')}
          >
            <div className={cx(styles.tag, styles.tagBlue)} style={{ cursor: 'pointer' }} title="">
              <Icon icon={ToyBrick} />
            </div>
          </Tooltip>
        )}
        {model.tokens !== undefined && (
          <Tooltip
            overlayStyle={{ maxWidth: 'unset', pointerEvents: 'none' }}
            placement={placement}
            title={t('ModelSelect.featureTag.tokens', {
              tokens: model.tokens === 0 ? '∞' : numeral(model.tokens).format('0,0'),
            })}
          >
            <Center className={styles.token} title="">
              {model.tokens === 0 ? (
                <Infinity size={17} strokeWidth={1.6} />
              ) : (
                formatTokenNumber(model.tokens)
              )}
            </Center>
          </Tooltip>
        )}
      </Flexbox>
    );
  },
);

interface ModelItemRenderProps extends ChatModelCard {
  showInfoTag?: boolean;
}

export const ModelItemRender = memo<ModelItemRenderProps>(({ showInfoTag = true, ...model }) => {
  return (
    <Flexbox align={'center'} gap={32} horizontal justify={'space-between'}>
      <Flexbox align={'center'} gap={8} horizontal>
        <ModelIcon model={model.id} size={20} />
        <Typography.Paragraph ellipsis={false} style={{ marginBottom: 0 }}>
          {model.displayName || model.id}
        </Typography.Paragraph>
      </Flexbox>

      {showInfoTag && <ModelInfoTags {...model} />}
    </Flexbox>
  );
});

interface ProviderItemRenderProps {
  name: string;
  provider: string;
}

export const ProviderItemRender = memo<ProviderItemRenderProps>(({ provider, name }) => (
  <Flexbox align={'center'} gap={4} horizontal>
    <ModelProviderIcon provider={provider} />
    {name}
  </Flexbox>
));
