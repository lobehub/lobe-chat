import { Switch, Text } from '@lobehub/ui-rn';
import { useState } from 'react';
import { View } from 'react-native';

const BasicDemo = () => {
  const [checked, setChecked] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Switch checked={checked} onChange={setChecked} size={'small'} />
        <Switch checked={checked} onChange={setChecked} size={'default'} />
        <Switch checked={checked} onChange={setChecked} size={'large'} />
      </View>
      <Text>当前状态：{checked ? '开启' : '关闭'}</Text>
    </View>
  );
};

export default BasicDemo;
