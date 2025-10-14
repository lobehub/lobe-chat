import { Cell, Flexbox } from '@lobehub/ui-rn';
import { Bell, Settings, Shield, User } from 'lucide-react-native';
import { Alert } from 'react-native';

export default () => {
  return (
    <Flexbox>
      <Cell icon={User} onPress={() => Alert.alert('Clicked')} title="Account" />
      <Cell icon={Settings} onPress={() => Alert.alert('Clicked')} title="Settings" />
      <Cell icon={Bell} onPress={() => Alert.alert('Clicked')} title="Notifications" />
      <Cell icon={Shield} onPress={() => Alert.alert('Clicked')} title="Privacy & Security" />
    </Flexbox>
  );
};
