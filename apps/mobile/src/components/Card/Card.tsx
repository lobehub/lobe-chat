import { ReactNode, isValidElement, memo, useMemo } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';

import Block from '../Block';
import Text from '../Text';
import { useStyles } from './style';
import type { CardProps } from './type';

type HoverState = { hovered: boolean; pressed: boolean };

const hasContent = (node: ReactNode) =>
  !(node === undefined || node === null || (typeof node === 'boolean' && node === false));

const renderTextLike = (
  content: ReactNode,
  defaultStyle: StyleProp<TextStyle>,
  customStyle?: StyleProp<TextStyle>,
) => {
  if (!hasContent(content)) return null;

  if (isValidElement(content)) return content;

  if (typeof content === 'string' || typeof content === 'number') {
    return <Text style={[defaultStyle, customStyle]}>{content}</Text>;
  }

  return content;
};

const Card = memo<CardProps>(
  ({ title, extra, cover, children, style, variant = 'outlined', ...rest }) => {
    const { styles } = useStyles();

    const composedStyle = useMemo(() => {
      if (typeof style === 'function') {
        return (state: HoverState) => [styles.container, style(state)];
      }
      return [styles.container, style];
    }, [style, styles.container]);

    const shouldRenderHeader = hasContent(title) || hasContent(extra);
    const shouldRenderContent = hasContent(children);
    const shouldRenderCover = hasContent(cover);

    const titleNode = renderTextLike(title, styles.title);

    const header = shouldRenderHeader ? (
      <View style={[styles.header]} testID="card-header">
        {(hasContent(title) || hasContent(extra)) && (
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>{titleNode}</View>
            {hasContent(extra) ? <View style={styles.extra}>{extra}</View> : null}
          </View>
        )}
      </View>
    ) : null;

    const content = shouldRenderContent ? (
      <View style={[styles.content]} testID="card-content">
        {children}
      </View>
    ) : null;

    return (
      <Block style={composedStyle} variant={variant} {...rest}>
        {shouldRenderCover ? (
          <View style={[styles.cover]} testID="card-cover">
            {isValidElement(cover)
              ? cover
              : typeof cover === 'string' || typeof cover === 'number'
                ? renderTextLike(cover, styles.title)
                : cover}
          </View>
        ) : null}
        {header}
        {content}
      </Block>
    );
  },
);

Card.displayName = 'Card';

export default Card;
