import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
  X,
} from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement, memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import ActionIcon from '../ActionIcon';
import Icon from '../Icon';
import Text from '../Text';
import { getAlertStatusTokens, useStyles } from './style';
import type { AlertProps, AlertType } from './type';

const statusIconMap: Record<AlertType, LucideIcon> = {
  error: AlertCircle,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

const Alert = memo<AlertProps>(
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

    const renderTextContent = (value: ReactNode, defaultStyle: StyleProp<TextStyle>): ReactNode => {
      if (value === undefined || value === null) return null;

      if (typeof value === 'string' || typeof value === 'number') {
        return <Text style={[defaultStyle]}>{value}</Text>;
      }

      if (isValidElement(value) && value.type === Text) {
        const textElement = value as ReactElement<{ style?: StyleProp<TextStyle> }>;

        return cloneElement(textElement, {
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
      <View style={[styles.container, style]} testID="alert">
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
