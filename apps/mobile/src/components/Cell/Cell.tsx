import { ChevronRight, Loader2Icon } from 'lucide-react-native';
import { memo } from 'react';

import Block from '@/components/Block';
import Flexbox from '@/components/Flexbox';
import Icon from '@/components/Icon';
import Text from '@/components/Text';
import { useTheme } from '@/components/styles';

import type { CellProps } from './type';

const Cell = memo<CellProps>(
  ({ description, title, showArrow = true, icon, extra, arrowIcon, loading, style, ...rest }) => {
    const theme = useTheme();
    const titleNode = typeof title === 'string' ? <Text fontSize={16}>{title}</Text> : title;
    const descriptionNode =
      typeof description === 'string' ? <Text type={'secondary'}>{description}</Text> : description;
    const rightNode = (
      <Flexbox align={'center'} gap={8} horizontal>
        {typeof extra === 'string' ? <Text type={'secondary'}>{extra}</Text> : extra}
        {showArrow && <Icon color={theme.colorTextDescription} icon={arrowIcon || ChevronRight} />}
      </Flexbox>
    );
    return (
      <Block
        align={'center'}
        borderRadius={0}
        clickable
        horizontal
        justify={'space-between'}
        paddingBlock={14}
        paddingInline={16}
        style={({ hovered, pressed }) => [
          { minHeight: 48 },
          typeof style === 'function' ? style({ hovered, pressed }) : style,
        ]}
        variant={'borderless'}
        {...rest}
      >
        <Flexbox align={'center'} flex={1} gap={10} horizontal>
          {icon && <Icon icon={icon} size={18} />}
          {descriptionNode ? (
            <Flexbox gap={4}>
              {titleNode}
              {descriptionNode}
            </Flexbox>
          ) : (
            titleNode
          )}
        </Flexbox>
        {loading ? <Icon color={theme.colorTextDescription} icon={Loader2Icon} spin /> : rightNode}
      </Block>
    );
  },
);

Cell.displayName = 'Cell';

export default Cell;
