import React from 'react';
import { View } from 'react-native';
import { Plus, Search, Upload } from 'lucide-react-native';

import Button from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const ShapeDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Button icon={<Search />} shape="circle" size="small" type="default" />
      <Button icon={<Plus />} shape="circle" size="middle" type="dashed" />
      <Button icon={<Upload />} shape="circle" size="large" type="primary" />
    </View>
  );
};

export default ShapeDemo;
