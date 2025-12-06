import { ModelIcon } from '@lobehub/icons';
import { Text } from '@lobehub/ui';
import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import { AiModelForSelect } from 'model-bank';
import numeral from 'numeral';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import NewModelBadge from '@/components/ModelSelect/NewModelBadge';

const POPOVER_MAX_WIDTH = 320;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  descriptionText: css`
    color: ${isDarkMode ? token.colorText : token.colorTextSecondary};
  `,
  popover: css`
    .ant-popover-inner {
      background: ${isDarkMode ? token.colorBgSpotlight : token.colorBgElevated};
    }
  `,
  priceText: css`
    font-weight: 500;
    color: ${isDarkMode ? token.colorTextLightSolid : token.colorTextTertiary};
  `,
}));

type ImageModelItemProps = AiModelForSelect & {
  /**
   * Whether to show new model badge
   * @default true
   */
  showBadge?: boolean;
  /**
   * Whether to show popover on hover
   * @default true
   */
  showPopover?: boolean;
};

const ImageModelItem = memo<ImageModelItemProps>(
  ({
    approximatePricePerImage,
    description,
    pricePerImage,
    showPopover = true,
    showBadge = true,
    ...model
  }) => {
    const { styles } = useStyles();

    const priceLabel = useMemo(() => {
      // Priority 1: Use exact price
      if (typeof pricePerImage === 'number') {
        return `${numeral(pricePerImage).format('$0,0.00[000]')} / image`;
      }

      // Priority 2: Use approximate price with prefix
      if (typeof approximatePricePerImage === 'number') {
        return `~ ${numeral(approximatePricePerImage).format('$0,0.00[000]')} / image`;
      }

      return undefined;
    }, [approximatePricePerImage, pricePerImage]);

    const popoverContent = useMemo(() => {
      if (!description && !priceLabel) return null;

      return (
        <Flexbox gap={8} style={{ maxWidth: POPOVER_MAX_WIDTH }}>
          {description && <Text className={styles.descriptionText}>{description}</Text>}
          {priceLabel && <Text className={styles.priceText}>{priceLabel}</Text>}
        </Flexbox>
      );
    }, [description, priceLabel, styles.descriptionText, styles.priceText]);

    const content = (
      <Flexbox align={'center'} gap={8} horizontal style={{ overflow: 'hidden' }}>
        <ModelIcon model={model.id} size={20} />
        <Text ellipsis title={model.displayName || model.id}>
          {model.displayName || model.id}
        </Text>
        {showBadge && <NewModelBadge releasedAt={model.releasedAt} />}
      </Flexbox>
    );

    if (!showPopover || !popoverContent) return content;

    return (
      <Popover
        align={{
          offset: [24, -10],
        }}
        arrow={false}
        classNames={{ root: styles.popover }}
        content={popoverContent}
        placement="rightTop"
      >
        {content}
      </Popover>
    );
  },
);

ImageModelItem.displayName = 'ImageModelItem';

export default ImageModelItem;
