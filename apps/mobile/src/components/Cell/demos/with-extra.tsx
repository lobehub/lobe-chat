import { Cell, Flexbox, Text } from '@lobehub/ui-rn';
import { Globe, Moon, Palette } from 'lucide-react-native';
import { Switch } from 'react-native';

export default () => {
  return (
    <Flexbox>
      <Cell extra="English" icon={Globe} title="Language" />
      <Cell extra="Auto" icon={Palette} title="Theme" />
      <Cell extra={<Switch value={false} />} icon={Moon} showArrow={false} title="Dark Mode" />
      <Cell extra={<Text type="secondary">1.0.0</Text>} showArrow={false} title="Version" />
    </Flexbox>
  );
};
