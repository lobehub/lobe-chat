import React from 'react';
import { ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SettingItem, SettingGroup } from '../(components)';
import { useStyles } from './styles';
import {
  clearAuthData,
  expireAccessTokenNow,
  expireRefreshTokenNow,
  invalidateAccessToken,
  invalidateRefreshToken,
} from './utils';

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
      <SettingGroup>
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
      </SettingGroup>
      <SettingGroup>
        <SettingItem
          onPress={async () => {
            try {
              await expireAccessTokenNow();
              Alert.alert('Developer', '已使访问令牌立即过期');
            } catch (e) {
              Alert.alert('Developer', `操作失败: ${e instanceof Error ? e.message : e}`);
            }
          }}
          title="访问令牌过期"
        />
        <SettingItem
          onPress={async () => {
            try {
              await expireRefreshTokenNow();
              Alert.alert('Developer', '已使刷新令牌立即过期');
            } catch (e) {
              Alert.alert('Developer', `操作失败: ${e instanceof Error ? e.message : e}`);
            }
          }}
          title="刷新令牌过期"
        />
        <SettingItem
          onPress={async () => {
            try {
              await invalidateAccessToken();
              Alert.alert('Developer', '已写入无效的访问令牌');
            } catch (e) {
              Alert.alert('Developer', `操作失败: ${e instanceof Error ? e.message : e}`);
            }
          }}
          title="无效访问令牌"
        />
        <SettingItem
          onPress={async () => {
            try {
              await invalidateRefreshToken();
              Alert.alert('Developer', '已写入无效的刷新令牌');
            } catch (e) {
              Alert.alert('Developer', `操作失败: ${e instanceof Error ? e.message : e}`);
            }
          }}
          title="无效刷新令牌"
        />
        <SettingItem
          isLast
          onPress={async () => {
            try {
              await clearAuthData();
              Alert.alert('Developer', '已清空认证数据');
            } catch (e) {
              Alert.alert('Developer', `操作失败: ${e instanceof Error ? e.message : e}`);
            }
          }}
          title="清空认证数据"
        />
      </SettingGroup>
    </ScrollView>
  );
}
