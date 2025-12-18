import { ChatModelCard } from '@lobechat/types';
import { IconAvatarProps, ModelIcon, ProviderIcon } from '@lobehub/icons';
import { Avatar, Icon, Tag, Text, Tooltip } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import {
  Infinity,
  AtomIcon,
  LucideEye,
  LucideGlobe,
  LucideImage,
  LucidePaperclip,
  ToyBrick,
  Video,
} from 'lucide-react';
import { ModelAbilities } from 'model-bank';
import numeral from 'numeral';
import { type ComponentProps, FC, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { AiProviderSourceType } from '@/types/aiProvider';
import { formatTokenNumber } from '@/utils/format';

import NewModelBadgeI18n, { NewModelBadge as NewModelBadgeCore } from './NewModelBadge';

export const TAG_CLASSNAME = 'lobe-model-info-tags';

const useStyles = createStyles(({ css, token }) => ({
  tag: css`
    cursor: default;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 20px !important;
    height: 20px;
    border-radius: 4px;
  `,
  token: css`
    width: 36px !important;
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
  /**
   * Whether to render tooltip overlays for each tag.
   * Disable this when rendering a large list (e.g. dropdown menus) to avoid mounting hundreds of Tooltip instances.
   *
   * When `false`, tags are rendered without any tooltip/title fallback by design.
   */
  withTooltip?: boolean;
}

export const ModelInfoTags = memo<ModelInfoTagsProps>(
  ({ directionReverse, placement = 'right', withTooltip = true, ...model }) => {
    const { t } = useTranslation('components');
    const { styles } = useStyles();

    const renderTag = (
      enabled: boolean | undefined,
      getTitle: () => string,
      color: Parameters<typeof Tag>[0]['color'],
      icon: Parameters<typeof Icon>[0]['icon'],
      className = styles.tag,
      tooltipStyles?: ComponentProps<typeof Tooltip>['styles'],
    ) => {
      if (!enabled) return null;

      const tag = (
        <Tag className={className} color={color} size={'small'}>
          <Icon icon={icon} />
        </Tag>
      );

      if (!withTooltip) return tag;

      const title = getTitle();
      return (
        <Tooltip
          placement={placement}
          styles={tooltipStyles ?? { root: { pointerEvents: 'none' } }}
          title={title}
        >
          {tag}
        </Tooltip>
      );
    };

    return (
      <Flexbox
        className={TAG_CLASSNAME}
        direction={directionReverse ? 'horizontal-reverse' : 'horizontal'}
        gap={4}
        width={'fit-content'}
      >
        {renderTag(model.files, () => t('ModelSelect.featureTag.file'), 'success', LucidePaperclip)}
        {renderTag(
          model.imageOutput,
          () => t('ModelSelect.featureTag.imageOutput'),
          'success',
          LucideImage,
        )}
        {renderTag(model.vision, () => t('ModelSelect.featureTag.vision'), 'success', LucideEye)}
        {renderTag(model.video, () => t('ModelSelect.featureTag.video'), 'magenta', Video)}
        {renderTag(
          model.functionCall,
          () => t('ModelSelect.featureTag.functionCall'),
          'info',
          ToyBrick,
          styles.tag,
          {
            root: { maxWidth: 'unset', pointerEvents: 'none' },
          },
        )}
        {renderTag(
          model.reasoning,
          () => t('ModelSelect.featureTag.reasoning'),
          'purple',
          AtomIcon,
        )}
        {renderTag(model.search, () => t('ModelSelect.featureTag.search'), 'cyan', LucideGlobe)}
        {typeof model.contextWindowTokens === 'number' &&
          (() => {
            const tokensText =
              model.contextWindowTokens === 0 ? '∞' : formatTokenNumber(model.contextWindowTokens);

            const tag = (
              <Tag className={styles.token} size={'small'}>
                {model.contextWindowTokens === 0 ? (
                  <Infinity size={17} strokeWidth={1.6} />
                ) : (
                  tokensText
                )}
              </Tag>
            );

            if (!withTooltip) return tag;

            return (
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
                {tag}
              </Tooltip>
            );
          })()}
      </Flexbox>
    );
  },
);

interface ModelItemRenderProps extends ChatModelCard {
  abilities?: ModelAbilities;
  infoTagTooltip?: boolean;
  /**
   * Only mounts Tooltip components while hovering the item, to reduce initial render cost in large dropdown lists.
   *
   * Note: hover is not available on mobile, so this will be ignored on mobile.
   * Also note: since tooltips are mounted lazily, the very first hover may require a tiny pointer movement
   * before the tooltip system detects the hover target (depends on the underlying tooltip implementation).
   */
  infoTagTooltipOnHover?: boolean;
  newBadgeLabel?: string;
  showInfoTag?: boolean;
}

export const ModelItemRender = memo<ModelItemRenderProps>(({ showInfoTag = true, ...model }) => {
  const { mobile } = useResponsive();
  const [hovered, setHovered] = useState(false);
  const {
    abilities,
    infoTagTooltip = true,
    infoTagTooltipOnHover = false,
    contextWindowTokens,
    files,
    functionCall,
    imageOutput,
    newBadgeLabel,
    reasoning,
    search,
    video,
    vision,
  } = model;

  const shouldLazyMountTooltip = infoTagTooltipOnHover && !mobile;
  /**
   * When `infoTagTooltipOnHover` is enabled, we don't mount Tooltip components until the row is hovered.
   * This avoids creating many overlays on dropdown open, while keeping the tooltip UX on demand.
   */
  const withTooltip = infoTagTooltip && (!shouldLazyMountTooltip || hovered);

  return (
    <Flexbox
      align={'center'}
      gap={32}
      horizontal
      justify={'space-between'}
      onMouseEnter={shouldLazyMountTooltip ? () => setHovered(true) : undefined}
      onMouseLeave={shouldLazyMountTooltip ? () => setHovered(false) : undefined}
      style={{
        minWidth: mobile ? '100%' : undefined,
        overflow: 'hidden',
        position: 'relative',
        width: mobile ? '80vw' : 'auto',
      }}
    >
      <Flexbox
        align={'center'}
        gap={8}
        horizontal
        style={{ flexShrink: 1, minWidth: 0, overflow: 'hidden' }}
      >
        <ModelIcon model={model.id} size={20} />
        <Text style={mobile ? { maxWidth: '60vw', overflowX: 'auto', whiteSpace: 'nowrap' } : {}}>
          {model.displayName || model.id}
        </Text>
        {newBadgeLabel ? (
          <NewModelBadgeCore label={newBadgeLabel} releasedAt={model.releasedAt} />
        ) : (
          <NewModelBadgeI18n releasedAt={model.releasedAt} />
        )}
      </Flexbox>
      {showInfoTag && (
        <ModelInfoTags
          contextWindowTokens={contextWindowTokens}
          files={files ?? abilities?.files}
          functionCall={functionCall ?? abilities?.functionCall}
          imageOutput={imageOutput ?? abilities?.imageOutput}
          reasoning={reasoning ?? abilities?.reasoning}
          search={search ?? abilities?.search}
          video={video ?? abilities?.video}
          vision={vision ?? abilities?.vision}
          withTooltip={withTooltip}
        />
      )}
    </Flexbox>
  );
});

interface ProviderItemRenderProps {
  logo?: string;
  name: string;
  provider: string;
  source?: AiProviderSourceType;
}

export const ProviderItemRender = memo<ProviderItemRenderProps>(
  ({ provider, name, source, logo }) => {
    return (
      <Flexbox align={'center'} gap={4} horizontal>
        {source === 'custom' && !!logo ? (
          <Avatar avatar={logo} size={20} style={{ filter: 'grayscale(1)' }} title={name} />
        ) : (
          <ProviderIcon provider={provider} size={20} type={'mono'} />
        )}
        {name}
      </Flexbox>
    );
  },
);

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
