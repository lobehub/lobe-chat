import {
  TBody as TBodyElement,
  TD as TDElement,
  TFoot as TFootElement,
  TH as THElement,
  THead as THeadElement,
  TR as TRElement,
  Table as TableElement,
} from '@expo/html-elements';
import { PropsWithChildren, memo } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { useStyles } from '../style';

export const Table = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <TableElement style={styles.table}>
      <ScrollView
        decelerationRate="fast"
        directionalLockEnabled={false}
        horizontal
        nestedScrollEnabled
        removeClippedSubviews={false}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      >
        <View
          pointerEvents={'box-none'}
          style={{
            minWidth: '100%',
          }}
        >
          {children}
        </View>
      </ScrollView>
    </TableElement>
  );
});

export const TBody = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <TBodyElement style={styles.tableBody}>{children}</TBodyElement>;
});

export const TD = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <TDElement style={styles.tableRowCell}>
      <Text style={styles.text}>{children}</Text>
    </TDElement>
  );
});

export const TFoot = memo<PropsWithChildren>(({ children }) => {
  return <TFootElement>{children}</TFootElement>;
});

export const TH = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <THElement style={styles.tableHeaderCell}>
      <Text style={[styles.text, styles.strong]}>{children}</Text>
    </THElement>
  );
});

export const THead = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <THeadElement style={styles.tableHeader}>{children}</THeadElement>;
});

export const TR = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <TRElement style={styles.tableRow}>{children}</TRElement>;
});
