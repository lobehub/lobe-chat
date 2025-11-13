import { ModelIcon } from '@lobehub/icons';
import { Text } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { AiModelForSelect } from 'model-bank';
import numeral from 'numeral';
import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

type ImageModelItemProps = AiModelForSelect;

const ImageModelItem = memo<ImageModelItemProps>(
  ({ approximatePricePerImage, pricePerImage, ...model }) => {
    const { mobile } = useResponsive();

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

    return (
      <Flexbox
        align={'center'}
        gap={32}
        horizontal
        justify={'space-between'}
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
        </Flexbox>
        {priceLabel && (
          <Text style={{ whiteSpace: 'nowrap' }} type={'secondary'}>
            {priceLabel}
          </Text>
        )}
      </Flexbox>
    );
  },
);

ImageModelItem.displayName = 'ImageModelItem';

export default ImageModelItem;
