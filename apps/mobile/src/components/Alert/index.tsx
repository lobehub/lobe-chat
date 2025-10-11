import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react-native';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import ActionIcon from '@/components/ActionIcon';
import Icon from '@/components/Icon';

import { getAlertStatusTokens, useStyles } from './style';
import type { AlertProps, AlertType } from './type';

const statusIconMap: Record<AlertType, React.ComponentType> = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

const Alert: React.FC<AlertProps> = memo(
  ({
    type = 'info',
    message,
    description,
    showIcon = true,
    icon,
    action,
    closable = false,
    onClose,
    style,
  }) => {
    const [visible, setVisible] = useState(true);
    const { styles, theme } = useStyles(type);
    const statusTokens = useMemo(() => getAlertStatusTokens(theme, type), [theme, type]);

    const handleClose = useCallback(() => {
      setVisible(false);
      onClose?.();
    }, [onClose]);

    const renderTextContent = (
      value: React.ReactNode,
      defaultStyle: StyleProp<TextStyle>,
    ): React.ReactNode => {
      if (value === undefined || value === null) return null;

      if (typeof value === 'string' || typeof value === 'number') {
        return <Text style={[defaultStyle]}>{value}</Text>;
      }

      if (React.isValidElement(value) && value.type === Text) {
        const textElement = value as React.ReactElement<{ style?: StyleProp<TextStyle> }>;

        return React.cloneElement(textElement, {
          style: [defaultStyle, textElement.props.style],
        });
      }

      return value;
    };

    const renderIcon = () => {
      if (!showIcon) return null;

      if (icon) {
        return <View style={styles.iconWrapper}>{icon}</View>;
      }

      const IconComponent = statusIconMap[type] ?? statusIconMap.info;

      return (
        <View style={styles.iconWrapper}>
          <Icon color={statusTokens.iconColor} icon={IconComponent} size="small" />
        </View>
      );
    };

    const renderClose = () => {
      if (!closable) {
        return null;
      }

      return (
        <ActionIcon
          accessibilityLabel="Close alert"
          color={theme.colorTextSecondary}
          icon={X}
          onPress={handleClose}
          size="small"
          style={styles.close}
          variant="borderless"
        />
      );
    };

    if (!visible) {
      return null;
    }

    return (
      <View style={[styles.container, style]}>
        {renderIcon()}
        <View style={[styles.content]}>
          {renderTextContent(message, styles.message)}
          {description ? renderTextContent(description, styles.description) : null}
          {action ? <View style={styles.action}>{action}</View> : null}
        </View>
        {renderClose()}
      </View>
    );
  },
);

Alert.displayName = 'Alert';

export default Alert;
export type { AlertProps, AlertType } from './type';
