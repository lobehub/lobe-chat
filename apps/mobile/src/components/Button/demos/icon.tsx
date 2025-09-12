import React from 'react';
import { View } from 'react-native';
import { ArrowRight, Check, Plus, Search } from 'lucide-react-native';

import Button from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
}));

const IconDemo = () => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Button icon={<Plus />} onPress={() => console.log('Create clicked')} type="primary">
        Create
      </Button>

      <Button icon={<Search />} onPress={() => console.log('Search clicked')} type="default">
        Search
      </Button>

      <Button icon={<Check />} onPress={() => console.log('Confirm clicked')} type="text">
        Confirm
      </Button>

      <Button icon={<ArrowRight />} onPress={() => console.log('Next clicked')} type="link">
        Next
      </Button>
    </View>
  );
};

export default IconDemo;
