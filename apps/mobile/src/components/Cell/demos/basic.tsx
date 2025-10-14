import { Cell, Flexbox } from '@lobehub/ui-rn';
import { Alert } from 'react-native';

export default () => {
  return (
    <Flexbox>
      <Cell onPress={() => Alert.alert('Clicked')} title="Basic Cell" />
      <Cell extra="Value" onPress={() => Alert.alert('Clicked')} title="Cell with Extra" />
      <Cell onPress={() => Alert.alert('Clicked')} showArrow={false} title="Cell without Arrow" />
      <Cell
        description={'Here is description example'}
        onPress={() => Alert.alert('Clicked')}
        title="Cell without Desc"
      />
      <Cell loading onPress={() => Alert.alert('Clicked')} title="Loading Cell" />
    </Flexbox>
  );
};
