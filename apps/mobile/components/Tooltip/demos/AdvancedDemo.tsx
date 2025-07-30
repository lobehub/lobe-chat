import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeToken } from '@/mobile/theme/context';

import { Tooltip } from '..';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
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
  secondaryButton: {
    borderWidth: 1,
  },
  smallButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
          <TouchableOpacity
            onPress={() => setVisible(!visible)}
            style={[styles.button, { backgroundColor: token.colorPrimary }]}
          >
            <Text style={[styles.buttonText, { color: token.colorText }]}>
              {visible ? '隐藏' : '显示'}提示
            </Text>
          </TouchableOpacity>
        </Tooltip>
      </View>

      {/* 自定义内容 */}
      <View style={styles.demoSection}>
        <Text style={[styles.subTitle, { color: token.colorTextSecondary }]}>自定义内容</Text>
        <Tooltip
          title={
            <View>
              <Text style={[styles.customTitle, { color: token.colorBgBase }]}>自定义标题</Text>
              <Text style={[styles.customContent, { color: token.colorBgBase }]}>
                这是一个自定义的提示内容
              </Text>
            </View>
          }
        >
          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              {
                backgroundColor: token.colorFillSecondary,
                borderColor: token.colorBorder,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: token.colorText }]}>自定义内容</Text>
          </TouchableOpacity>
        </Tooltip>
      </View>

      {/* 不同颜色 */}
      <View style={styles.demoSection}>
        <Text style={[styles.subTitle, { color: token.colorTextSecondary }]}>自定义颜色</Text>
        <View style={styles.colorRow}>
          <Tooltip color={token.colorSuccess} title="成功提示">
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: token.colorSuccess }]}>
              <Text style={[styles.buttonText, { color: token.colorText }]}>成功</Text>
            </TouchableOpacity>
          </Tooltip>

          <Tooltip color={token.colorWarning} title="警告提示">
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: token.colorWarning }]}>
              <Text style={[styles.buttonText, { color: token.colorText }]}>警告</Text>
            </TouchableOpacity>
          </Tooltip>

          <Tooltip color={token.colorError} title="错误提示">
            <TouchableOpacity style={[styles.smallButton, { backgroundColor: token.colorError }]}>
              <Text style={[styles.buttonText, { color: token.colorText }]}>错误</Text>
            </TouchableOpacity>
          </Tooltip>
        </View>
      </View>
    </View>
  );
};

export default AdvancedDemo;
