import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeToken } from '@/theme';
import Button from '@/components/Button';

import { Tooltip } from '..';

const styles = StyleSheet.create({
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  customContent: {
    fontSize: 12,
  },
  customTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  demoContainer: {
    flex: 1,
    padding: 16,
  },
  demoSection: {
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
});

const AdvancedDemo = () => {
  const token = useThemeToken();
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.demoContainer, { backgroundColor: token.colorBgLayout }]}>
      {/* 受控模式 */}
      <View style={styles.demoSection}>
        <Text style={[styles.subTitle, { color: token.colorTextSecondary }]}>受控模式</Text>
        <Tooltip title="受控提示" trigger="none" visible={visible}>
          <Button onPress={() => setVisible(!visible)} type="primary">
            {visible ? '隐藏' : '显示'}提示
          </Button>
        </Tooltip>
      </View>

      {/* 自定义内容 */}
      <View style={styles.demoSection}>
        <Text style={[styles.subTitle, { color: token.colorTextSecondary }]}>自定义内容</Text>
        <Tooltip
          title={
            <View>
              <Text style={[styles.customTitle, { color: token.colorBgContainer }]}>
                自定义标题
              </Text>
              <Text style={[styles.customContent, { color: token.colorBgContainer }]}>
                这是一个自定义的提示内容
              </Text>
            </View>
          }
        >
          <Button type="default">自定义内容</Button>
        </Tooltip>
      </View>

      {/* 不同颜色 */}
      <View style={styles.demoSection}>
        <Text style={[styles.subTitle, { color: token.colorTextSecondary }]}>自定义颜色</Text>
        <View style={styles.colorRow}>
          <Tooltip color={token.colorSuccess} title="成功提示">
            <Button size="small" style={{ backgroundColor: token.colorSuccess }} type="default">
              成功
            </Button>
          </Tooltip>

          <Tooltip color={token.colorWarning} title="警告提示">
            <Button size="small" style={{ backgroundColor: token.colorWarning }} type="default">
              警告
            </Button>
          </Tooltip>

          <Tooltip color={token.colorError} title="错误提示">
            <Button size="small" style={{ backgroundColor: token.colorError }} type="default">
              错误
            </Button>
          </Tooltip>
        </View>
      </View>
    </View>
  );
};

export default AdvancedDemo;
