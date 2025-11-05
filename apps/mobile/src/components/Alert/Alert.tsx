import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  type LucideIcon,
  X,
} from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement, memo, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { cva } from '@/components/styles';

import ActionIcon from '../ActionIcon';
import Block from '../Block';
import Flexbox from '../Flexbox';
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
    closeIcon,
    onClose,
    style,
    variant = 'filled',
    extra,
    extraDefaultExpand = false,
    extraIsolate = false,
    colorfulText = true,
  }) => {
    const [visible, setVisible] = useState(true);
    const [expand, setExpand] = useState(extraDefaultExpand);
    const { styles, theme } = useStyles(type);
    const statusTokens = useMemo(() => getAlertStatusTokens(theme, type), [theme, type]);

    const handleClose = useCallback(() => {
      setVisible(false);
      onClose?.();
    }, [onClose]);

    const renderTextContent = (
      value: ReactNode,
      baseStyle: StyleProp<TextStyle>,
      colorStyle: StyleProp<TextStyle>,
    ): ReactNode => {
      if (value === undefined || value === null) return null;

      if (typeof value === 'string' || typeof value === 'number') {
        return (
          <Text
            fontSize={description ? 16 : 14}
            style={[baseStyle, colorStyle]}
            weight={description ? 500 : 400}
          >
            {value}
          </Text>
        );
      }

      if (isValidElement(value) && value.type === Text) {
        const textElement = value as ReactElement<{ style?: StyleProp<TextStyle> }>;

        return cloneElement(textElement, {
          style: [baseStyle, colorStyle, textElement.props.style],
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

      const CloseIcon = closeIcon || X;

      return (
        <ActionIcon
          color={theme.colorTextDescription}
          icon={CloseIcon}
          onPress={handleClose}
          size="small"
          style={styles.close}
        />
      );
    };

    // CVA for variant styles
    const variants = useMemo(
      () =>
        cva([styles.filled], {
          defaultVariants: {
            hasExtra: false,
            variant: 'filled',
          },
          variants: {
            hasExtra: {
              false: null,
              true: styles.hasExtra,
            },
            variant: {
              borderless: styles.borderless,
              filled: styles.filled,
              outlined: styles.outlined,
            },
          },
        }),
      [styles],
    );

    const extraVariants = useMemo(
      () =>
        cva([styles.extra], {
          defaultVariants: {
            variant: 'filled',
          },
          variants: {
            variant: {
              borderless: styles.extraBodyBorderless,
              filled: styles.extraFilled,
              outlined: styles.extraOutlined,
            },
          },
        }),
      [styles],
    );

    if (!visible) {
      return null;
    }

    const isInsideExtra = Boolean(!extraIsolate && !!extra);

    const alert = (
      <Block
        gap={8}
        horizontal
        padding={12}
        style={[variants({ hasExtra: isInsideExtra, variant }), style]}
        variant="outlined"
      >
        {renderIcon()}
        <Flexbox flex={1} gap={4}>
          {renderTextContent(
            message,
            styles.message,
            colorfulText ? styles.messageColorful : styles.messageDefault,
          )}
          {description
            ? renderTextContent(
                description,
                styles.description,
                colorfulText ? styles.descriptionColorful : styles.descriptionDefault,
              )
            : null}
          {action ? <View style={styles.action}>{action}</View> : null}
        </Flexbox>
        {renderClose()}
      </Block>
    );

    if (!extra) return alert;

    // extraIsolate: 额外内容作为独立的 Alert 显示
    if (extraIsolate) {
      return (
        <Flexbox gap={8} style={styles.container}>
          {alert}
          {extra}
        </Flexbox>
      );
    }

    // 默认: 额外内容作为可展开的部分
    return (
      <Flexbox style={styles.container}>
        {alert}
        <Flexbox style={[styles.extra, extraVariants({ variant })]}>
          {/* Extra Header - 展开/收起控制 */}
          <Flexbox
            align="center"
            gap={6}
            horizontal
            onPress={() => setExpand(!expand)}
            style={styles.extraHeader}
          >
            <ActionIcon
              color={statusTokens.iconColor}
              icon={expand ? ChevronDown : ChevronRight}
              onPress={() => setExpand(!expand)}
              size={18}
            />
            <Text
              color={statusTokens.messageColor}
              fontSize={description ? 14 : 12}
              style={styles.expandText}
            >
              {expand ? 'Hide Details' : 'Show Details'}
            </Text>
          </Flexbox>

          {/* Extra Body - 展开时显示 */}
          {expand && <View style={styles.extraBody}>{extra}</View>}
        </Flexbox>
      </Flexbox>
    );
  },
);

Alert.displayName = 'Alert';

export default Alert;
