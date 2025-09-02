import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Switch } from '@/components';

const BasicDemo: React.FC = () => {
  const [checked, setChecked] = useState(false);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>开关</Text>
        <Switch onValueChange={setChecked} value={checked} />
      </View>
      <Text>当前状态：{checked ? '开启' : '关闭'}</Text>
    </View>
  );
};

export default BasicDemo;
