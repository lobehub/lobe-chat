import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeToken } from '@/theme/ThemeProvider/context';

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
  demoContainer: {
    flex: 1,
    padding: 16,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoSection: {
    marginBottom: 16,
  },
  secondaryButton: {
    borderWidth: 1,
  },
});

const TriggerDemo = () => {
  const token = useThemeToken();

  return (
    <View style={[styles.demoContainer, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.demoSection}>
        <View style={styles.demoRow}>
          <Tooltip title="点击触发的提示" trigger="click">
            <TouchableOpacity style={[styles.button, { backgroundColor: token.colorPrimary }]}>
              <Text style={[styles.buttonText, { color: token.colorText }]}>点击触发</Text>
            </TouchableOpacity>
          </Tooltip>

          <Tooltip title="长按触发的提示" trigger="longPress">
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: token.colorBgContainer,
                  borderColor: token.colorBorder,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: token.colorText }]}>长按触发</Text>
            </TouchableOpacity>
          </Tooltip>
        </View>
      </View>
    </View>
  );
};

export default TriggerDemo;
