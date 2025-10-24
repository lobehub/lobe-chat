import { Loader2Icon } from 'lucide-react-native';
import { memo, useMemo } from 'react';

import { cva } from '@/components/styles';

import Block from '../Block';
import Icon from '../Icon';
import Text from '../Text';
import { useStyles } from './style';
import type { ButtonColor, ButtonProps, ButtonVariant } from './type';

const Button = memo<ButtonProps>(
  ({
    type = 'default',
    size = 'middle',
    shape = 'default',
    loading = false,
    disabled = false,
    block = false,
    danger = false,
    variant,
    color,
    children,
    onPress,
    style,
    textStyle,
    icon,
    iconProps,
    textProps,
    ...rest
  }) => {
    // Map legacy `type` to new `variant` + `color` if not explicitly provided
    const mapped = (() => {
      // If both provided, use them directly
      if (variant && color) return { color, variant };

      // If only color provided, choose a sensible default variant
      if (color && !variant) {
        // primary color uses filled (solid background); others use outlined
        return { color, variant: (color === 'primary' ? 'filled' : 'outlined') as ButtonVariant };
      }

      // If only variant provided, default color
      if (variant && !color) {
        return { color: (danger ? 'danger' : 'default') as ButtonColor, variant };
      }

      // Fallback: derive from legacy `type` and `danger`
      switch (type) {
        case 'primary': {
          return {
            color: (danger ? 'danger' : 'primary') as ButtonColor,
            variant: 'filled' as ButtonVariant,
          };
        }
        case 'text':
        case 'link': {
          return {
            color: (danger ? 'danger' : type === 'link' ? 'primary' : 'default') as ButtonColor,
            variant: 'borderless' as ButtonVariant,
          };
        }
        default: {
          return {
            color: (danger ? 'danger' : 'default') as ButtonColor,
            variant: 'outlined' as ButtonVariant,
          };
        }
      }
    })();

    const finalVariant = mapped.variant;
    const finalColor = mapped.color;
    const isDanger = danger || finalColor === 'danger';
    const isPrimary = finalColor === 'primary';
    const isLink = type === 'link'; // Track if it's a link type for underline effect

    const { styles } = useStyles({ size });

    // Use CVA to manage style variants
    const variants = useMemo(
      () =>
        cva(styles.root, {
          compoundVariants: [
            // Filled variants (primary/solid style)

            // Danger variants - Filled
            {
              danger: true,
              disabled: false,
              style: styles.dangerFilled,
              variant: 'filled',
            },
            {
              danger: true,
              disabled: false,
              style: styles.dangerBorderless,
              variant: 'borderless',
            },
            {
              danger: true,
              disabled: false,
              style: styles.dangerOutlined,
              variant: 'outlined',
            },
            {
              danger: true,
              disabled: false,
              pressed: true,
              style: styles.dangerFilledHover,
              variant: 'filled',
            },
            {
              danger: true,
              pressed: true,
              style: styles.dangerBorderlessHover,
              variant: 'borderless',
            },
            {
              danger: true,
              disabled: false,
              pressed: true,
              style: styles.dangerOutlinedHover,
              variant: 'outlined',
            },

            // primary
            {
              danger: false,
              pressed: true,
              style: styles.primaryHover,
              type: 'primary',
            },
            {
              danger: true,
              disabled: false,
              style: styles.dangerPrimary,
              type: 'primary',
            },
            {
              danger: true,
              pressed: true,
              style: styles.dangerPrimaryHover,
              type: 'primary',
            },

            // Loading state
            {
              loading: true,
              style: styles.loading,
            },

            // Block style
            {
              block: true,
              style: styles.block,
            },

            // Circle shape
            {
              circle: true,
              style: styles.circle,
            },
          ],
          defaultVariants: {},
          /* eslint-disable sort-keys-fix/sort-keys-fix */
          variants: {
            type: {
              default: null,
              link: null,
              primary: styles.primary,
              text: null,
            },
            variant: {
              borderless: null,
              filled: null,
              outlined: null,
            },
            block: {
              false: null,
              true: null,
            },
            circle: {
              false: null,
              true: null,
            },
            danger: {
              false: null,
              true: null,
            },
            hovered: {
              false: null,
              true: null,
            },
            isLink: {
              false: null,
              true: null,
            },
            loading: {
              false: null,
              true: null,
            },
            pressed: {
              false: null,
              true: null,
            },
            disabled: {
              false: null,
              true: styles.diabled,
            },
            /* eslint-enable sort-keys-fix/sort-keys-fix */
          },
        }),
      [styles],
    );

    // Get text color style
    const getTextColorStyle = () => {
      if (disabled) return styles.textColorDisabled;
      if (isDanger) {
        if (type === 'primary') {
          return styles.textColorDangerPrimary;
        }
        if (finalVariant === 'filled') {
          return styles.textColorDangerFilled;
        }
        return styles.textColorDanger;
      }
      if (isPrimary && finalVariant === 'filled') {
        return styles.textColorPrimary;
      }
      return styles.textColor;
    };

    const textColorStyle = getTextColorStyle();
    const isCircle = shape === 'circle';
    const iconSize = textColorStyle.fontSize || 16;

    return (
      <Block
        accessibilityRole="button"
        align={'center'}
        disabled={disabled}
        gap={isCircle ? 0 : 6}
        horizontal
        justify={'center'}
        onPress={(e) => {
          if (!disabled && !loading && onPress) {
            onPress?.(e);
          }
        }}
        pressEffect={!loading}
        style={({ pressed, hovered }) => [
          variants({
            block,
            circle: isCircle,
            danger: isDanger,
            disabled: disabled || loading,
            hovered,
            isLink,
            loading,
            pressed,
            type,
            variant: finalVariant,
          }),
          typeof style === 'function' ? style({ hovered, pressed }) : style,
        ]}
        testID="button"
        variant={finalVariant}
        {...rest}
      >
        {loading && (
          <Icon
            color={textColorStyle.color}
            icon={Loader2Icon}
            size={iconSize}
            spin
            {...iconProps}
          />
        )}
        {!loading && icon && (
          <Icon color={textColorStyle.color} icon={icon} size={iconSize} {...iconProps} />
        )}
        {children && !isCircle ? (
          <Text ellipsis style={[textColorStyle, textStyle]} weight={500} {...textProps}>
            {children}
          </Text>
        ) : undefined}
      </Block>
    );
  },
);

Button.displayName = 'Button';

export default Button;
