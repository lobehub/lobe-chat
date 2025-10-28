import { CheckIcon } from 'lucide-react-native';
import { readableColor } from 'polished';
import { memo } from 'react';
import { Components } from 'react-markdown';

import Block from '@/components/Block';
import Icon from '@/components/Icon';

import { useStyles } from '../style';

const Input: Components['input'] = memo(({ type, checked }) => {
  const { styles, theme } = useStyles();

  if (type === 'checkbox') {
    return (
      <Block
        align={'center'}
        borderRadius={4}
        height={styles.text.fontSize * 1.1}
        justify={'center'}
        style={{
          backgroundColor: checked ? theme.colorPrimary : undefined,
          borderWidth: 1,
          transform: [{ translateY: styles.text.fontSize / 5 }],
        }}
        variant={'outlined'}
        width={styles.text.fontSize * 1.1}
      >
        {checked && (
          <Icon
            color={readableColor(theme.colorPrimary)}
            icon={CheckIcon}
            size={{
              size: styles.text.fontSize * 0.8,
              strokeWidth: 3,
            }}
          />
        )}
      </Block>
    );
  }

  return null;
});

export default Input;
