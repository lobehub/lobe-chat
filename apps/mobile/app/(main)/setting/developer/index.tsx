import React from 'react';
import { ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ListGroup } from '@/components';
import { SettingItem } from '../(components)';
import { useStyles } from './styles';

export default function DeveloperScreen() {
  const { styles } = useStyles();
  const { t } = useTranslation(['setting']);

  // 占位：后续可接入全局调试开关或日志级别控制
  const [enableVerboseLog, setEnableVerboseLog] = React.useState(false);

  const toggleVerboseLog = (value: boolean) => {
    setEnableVerboseLog(value);
    Alert.alert(
      t('title', { ns: 'setting' }),
      `${t('developer', { ns: 'setting' })}: ${value ? 'ON' : 'OFF'}`,
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
      <ListGroup>
        <SettingItem
          onSwitchChange={toggleVerboseLog}
          showSwitch
          switchValue={enableVerboseLog}
          title="Verbose Log"
        />
        <SettingItem
          description="Open a placeholder action"
          isLast
          onPress={() => Alert.alert('Developer', 'Placeholder action')}
          title="Placeholder"
        />
      </ListGroup>
    </ScrollView>
  );
}
