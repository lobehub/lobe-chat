import { memo, useMemo } from 'react';
import { Text as RNText } from 'react-native';

import { cva } from '@/components/styles';

import { useStyles } from './style';
import type { TextProps } from './type';

const Text = memo<TextProps>(
  ({
    as,
    type,
    code,
    delete: isDelete,
    disabled,
    ellipsis,
    italic,
    strong,
    underline,
    color,
    weight,
    fontSize,
    align,
    numberOfLines,
    style,
    children,
    ...rest
  }) => {
    const { styles } = useStyles();

    const variants = useMemo(
      () =>
        cva(styles.text, {
          defaultVariants: {},
          variants: {
            as: {
              h1: styles.h1,
              h2: styles.h2,
              h3: styles.h3,
              h4: styles.h4,
              h5: styles.h5,
              p: styles.p,
            },
            code: {
              true: styles.code,
            },
            delete: {
              true: styles.delete,
            },
            disabled: {
              true: styles.disabled,
            },
            ellipsis: {
              multi: styles.ellipsisMulti,
              true: styles.ellipsis,
            },
            italic: {
              true: styles.italic,
            },
            strong: {
              true: styles.strong,
            },
            type: {
              danger: styles.danger,
              info: styles.info,
              secondary: styles.secondary,
              success: styles.success,
              warning: styles.warning,
            },
            underline: {
              true: styles.underline,
            },
          },
        }),
      [styles],
    );

    // 处理省略号配置
    const ellipsisVariant = useMemo(() => {
      if (!ellipsis) return undefined;
      if (typeof ellipsis === 'boolean') return true;
      if (typeof ellipsis === 'object' && ellipsis.rows && ellipsis.rows > 1) return 'multi';
      return true;
    }, [ellipsis]);

    // 计算行数
    const computedNumberOfLines = useMemo(() => {
      if (numberOfLines) return numberOfLines;
      if (typeof ellipsis === 'object' && ellipsis.rows) return ellipsis.rows;
      if (ellipsis) return 1;
      return undefined;
    }, [numberOfLines, ellipsis]);

    const textStyle = {
      ...(color && { color }),
      ...(weight && { fontWeight: weight }),
      ...(typeof ellipsis === 'object' &&
        ellipsis.rows &&
        {
          // WebkitLineClamp is not available in React Native
          // Use numberOfLines instead
        }),
      ...(fontSize && { fontSize }),
      ...(align && { textAlign: align }),
    };

    return (
      <RNText
        numberOfLines={computedNumberOfLines}
        pointerEvents={'none'}
        style={[
          variants({
            as,
            code: code || undefined,
            delete: isDelete || undefined,
            disabled: disabled || undefined,
            ellipsis: ellipsisVariant,
            italic: italic || undefined,
            strong: strong || undefined,
            type,
            underline: underline || undefined,
          }),
          textStyle,
          ...(Array.isArray(style) ? style : [style]),
        ]}
        textBreakStrategy={'highQuality'}
        {...rest}
      >
        {children}
      </RNText>
    );
  },
);

Text.displayName = 'Text';

export default Text;
