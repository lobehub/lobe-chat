import { ModelIcon } from '@lobehub/icons';
import { Text } from '@lobehub/ui';
import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import { AiModelForSelect } from 'model-bank';
import numeral from 'numeral';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

const POPOVER_MAX_WIDTH = 320;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  popover: css`
    .ant-popover-inner {
      color: ${isDarkMode ? token.colorTextLightSolid : token.colorText};
      background: ${isDarkMode ? token.colorBgSpotlight : token.colorBgElevated};
    }
  `,
}));

type ImageModelItemProps = AiModelForSelect & {
  /**
   * Whether to show popover on hover
   * @default true
   */
  showPopover?: boolean;
};

const ImageModelItem = memo<ImageModelItemProps>(
  ({ approximatePricePerImage, description, pricePerImage, showPopover = true, ...model }) => {
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
          {description && <Text type={'secondary'}>{description}</Text>}
          {priceLabel && (
            <Text style={{ fontWeight: 500 }} type={'secondary'}>
              {priceLabel}
            </Text>
          )}
        </Flexbox>
      );
    }, [description, priceLabel]);

    const content = (
      <Flexbox align={'center'} gap={8} horizontal style={{ overflow: 'hidden' }}>
        <ModelIcon model={model.id} size={20} />
        <Text ellipsis title={model.displayName || model.id}>
          {model.displayName || model.id}
        </Text>
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
