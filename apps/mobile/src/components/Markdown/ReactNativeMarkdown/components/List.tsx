import { Children, memo, useCallback, useContext, useMemo, useRef } from 'react';
import { Components } from 'react-markdown';
import { Text, View } from 'react-native';

import { useStyles } from '../style';
import TextWrapper from './TextWrapper';
import { ListContext } from './context';

export const OL: Components['ol'] = memo(({ children }) => {
  const { styles } = useStyles();
  const itemIndex = useRef(0);

  // 每次渲染时重置索引
  itemIndex.current = 0;

  const getItemIndex = useCallback(() => ++itemIndex.current, []);

  if (typeof children === 'string') return null;

  return (
    <ListContext.Provider value={{ getIndex: getItemIndex, type: 'ol' }}>
      <View style={styles.list}>
        <TextWrapper>{children}</TextWrapper>
      </View>
    </ListContext.Provider>
  );
});

export const UL: Components['ul'] = memo(({ children }) => {
  const { styles } = useStyles();

  if (typeof children === 'string') return null;
  return (
    <ListContext.Provider value={{ getIndex: () => 0, type: 'ul' }}>
      <View style={styles.list}>
        <TextWrapper>{children}</TextWrapper>
      </View>
    </ListContext.Provider>
  );
});

export const LI: Components['li'] = memo(({ children }) => {
  const { type, getIndex = () => 0 } = useContext(ListContext);
  const { styles } = useStyles();

  const content = useMemo(() => {
    let start: any = [];
    let end: any = [];
    let isNewBlock = false;

    Children.forEach(children, (child: any) => {
      isNewBlock = ['ul', 'ol'].includes(child?.props?.node?.tagName);
      if (isNewBlock) {
        end.push(child);
      } else {
        start.push(child);
      }
    });
    return {
      end,
      start,
    };
  }, [children]);

  return (
    <>
      <View style={styles.listItem}>
        <View>
          {type === 'ul' ? (
            <Text style={[styles.text, styles.listUnorderedIcon]}>-</Text>
          ) : (
            <Text style={[styles.text, styles.listOrderedIcon]}> {getIndex()}.</Text>
          )}
        </View>
        {content.start && (
          <Text style={styles.text}>
            <TextWrapper>{content.start}</TextWrapper>
          </Text>
        )}
      </View>
      {content.end && (
        <View style={styles.listNested}>
          <TextWrapper>{content.end}</TextWrapper>
        </View>
      )}
    </>
  );
});
