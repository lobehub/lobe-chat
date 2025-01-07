import { IconAvatarProps, ModelIcon, ProviderIcon } from '@lobehub/icons';
import { Icon, Tooltip } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Infinity, LucideEye, LucidePaperclip, ToyBrick } from 'lucide-react';
import numeral from 'numeral';
import { rgba } from 'polished';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { ModelAbilities } from '@/types/aiModel';
import { ChatModelCard } from '@/types/llm';
import { formatTokenNumber } from '@/utils/format';

const useStyles = createStyles(({ css, token }) => ({
  custom: css`
    width: 36px;
    height: 20px;
    border-radius: 4px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${rgba(token.colorWarning, 0.75)};

    background: ${token.colorWarningBg};
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
    border-radius: 4px;

    font-family: ${token.fontFamilyCode};
    font-size: 11px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
  `,
}));

interface ModelInfoTagsProps extends ModelAbilities {
  contextWindowTokens?: number | null;
  directionReverse?: boolean;
  isCustom?: boolean;
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
            placement={placement}
            styles={{ root: { pointerEvents: 'none' } }}
            title={t('ModelSelect.featureTag.file')}
          >
            <div className={cx(styles.tag, styles.tagGreen)} style={{ cursor: 'pointer' }} title="">
              <Icon icon={LucidePaperclip} />
            </div>
          </Tooltip>
        )}
        {model.vision && (
          <Tooltip
            placement={placement}
            styles={{ root: { pointerEvents: 'none' } }}
            title={t('ModelSelect.featureTag.vision')}
          >
            <div className={cx(styles.tag, styles.tagGreen)} style={{ cursor: 'pointer' }} title="">
              <Icon icon={LucideEye} />
            </div>
          </Tooltip>
        )}
        {model.functionCall && (
          <Tooltip
            placement={placement}
            styles={{
              root: { maxWidth: 'unset', pointerEvents: 'none' },
            }}
            title={t('ModelSelect.featureTag.functionCall')}
          >
            <div className={cx(styles.tag, styles.tagBlue)} style={{ cursor: 'pointer' }} title="">
              <Icon icon={ToyBrick} />
            </div>
          </Tooltip>
        )}
        {typeof model.contextWindowTokens === 'number' && (
          <Tooltip
            placement={placement}
            styles={{
              root: { maxWidth: 'unset', pointerEvents: 'none' },
            }}
            title={t('ModelSelect.featureTag.tokens', {
              tokens:
                model.contextWindowTokens === 0
                  ? '∞'
                  : numeral(model.contextWindowTokens).format('0,0'),
            })}
          >
            <Center className={styles.token} title="">
              {model.contextWindowTokens === 0 ? (
                <Infinity size={17} strokeWidth={1.6} />
              ) : (
                formatTokenNumber(model.contextWindowTokens as number)
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
    <ProviderIcon provider={provider} size={20} type={'mono'} />
    {name}
  </Flexbox>
));

interface LabelRendererProps {
  Icon: FC<IconAvatarProps>;
  label: string;
}

export const LabelRenderer = memo<LabelRendererProps>(({ Icon, label }) => (
  <Flexbox align={'center'} gap={8} horizontal>
    <Icon size={20} />
    <span>{label}</span>
  </Flexbox>
));
