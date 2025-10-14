import { Block, BlockProps, Flexbox, Text } from '@lobehub/ui-rn';
import type { ReactNode } from 'react';
import { Children, ReactElement, cloneElement, isValidElement } from 'react';

interface SettingGroupProps extends BlockProps {
  title?: ReactNode;
}

export const SettingGroup = ({
  children,
  title,
  variant = 'borderless',
  ...rest
}: SettingGroupProps) => {
  const items = Children.toArray(children);

  const newItems = items.map((child, index) => {
    if (isValidElement(child)) {
      const isLast = index === items.length - 1;
      return cloneElement(child as ReactElement<any>, { isLast });
    }
    return child;
  });

  return (
    <Block borderRadius={false} variant={variant} {...rest}>
      {title && (
        <Flexbox paddingBlock={8} paddingInline={16}>
          {typeof title === 'string' ? <Text type={'secondary'}>{title}</Text> : title}
        </Flexbox>
      )}
      <Flexbox>{newItems}</Flexbox>
    </Block>
  );
};
