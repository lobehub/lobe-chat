import { readableColor } from 'polished';
import { memo } from 'react';

import { useTheme } from '@/components/styles';

import Button from '../Button';
import SendIcon from './SendIcon';
import StopLoadingIcon from './StopLoadingIcon';
import type { SendButtonProps } from './type';

const SendButton = memo<SendButtonProps>(
  ({ generating = false, onSend, onStop, size = 'small', loading, disabled, ...rest }) => {
    const theme = useTheme();

    if (generating) {
      return (
        <Button
          glass={!disabled}
          icon={<StopLoadingIcon size={24} />}
          iconProps={{
            size: 24,
          }}
          onPress={onStop}
          shape="circle"
          size={size}
          {...rest}
        />
      );
    }

    if (loading) {
      return (
        <Button
          iconProps={{
            color: theme.colorTextSecondary,
            size: 20,
          }}
          loading={loading}
          shape="circle"
          size={size}
          {...rest}
        />
      );
    }

    if (disabled) {
      return (
        <Button
          disabled
          icon={SendIcon}
          iconProps={{
            fill: disabled ? theme.colorTextDescription : readableColor(theme.colorPrimary),
            size: 16,
          }}
          loading={loading}
          onPress={onSend}
          pointerEvents={'none'}
          shape="circle"
          size={size}
          style={{
            backgroundColor: 'transparent',
            borderColor: theme.colorTextQuaternary,
          }}
          type={disabled ? undefined : 'primary'}
          {...rest}
        />
      );
    }

    return (
      <Button
        glass
        glassColor={theme.colorPrimary}
        icon={SendIcon}
        iconProps={{
          fill: disabled ? theme.colorTextDescription : readableColor(theme.colorPrimary),
          size: 16,
        }}
        loading={loading}
        onPress={onSend}
        shape="circle"
        size={size}
        type={disabled ? undefined : 'primary'}
        {...rest}
      />
    );
  },
);

SendButton.displayName = 'SendButton';

export default SendButton;
