import { InboxIcon } from 'lucide-react-native';
import { memo } from 'react';

import { useTheme } from '@/components/styles';

import Center from '../Center';
import Flexbox from '../Flexbox';
import Icon from '../Icon';
import Text from '../Text';
import type { EmptyProps } from './type';

const Empty = memo<EmptyProps>(({ icon, iconSize, description, children, iconProps, ...rest }) => {
  const theme = useTheme();
  return (
    <Flexbox align={'center'} gap={12} justify={'center'} paddingBlock={16} {...rest}>
      <Center>
        <Icon
          color={theme.colorTextQuaternary}
          icon={icon || InboxIcon}
          size={
            iconSize || {
              size: 48,
              strokeWidth: 1.2,
            }
          }
          {...iconProps}
        />
      </Center>
      {typeof description === 'string' ? (
        <Text type={'secondary'}>{description}</Text>
      ) : (
        description
      )}
      {children}
    </Flexbox>
  );
});

Empty.displayName = 'Empty';

export default Empty;
