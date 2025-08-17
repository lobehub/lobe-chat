import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useThemeToken } from '@/theme/ThemeProvider/context';

import { Tooltip } from '..';
import type { TooltipPlacement } from '..';

const placements: TooltipPlacement[] = [
  'topLeft',
  'top',
  'topRight',
  'leftTop',
  'left',
  'leftBottom',
  'rightTop',
  'right',
  'rightBottom',
  'bottomLeft',
  'bottom',
  'bottomRight',
];

const styles = StyleSheet.create({
  demoContainer: {
    flex: 1,
    padding: 40,
  },
  demoSection: {
    marginBottom: 40,
  },
  placementButton: {
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  placementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  placementText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

const PositionDemo = () => {
  const token = useThemeToken();

  return (
    <View style={[styles.demoContainer, { backgroundColor: token.colorBgLayout }]}>
      <View style={styles.demoSection}>
        <View style={styles.placementGrid}>
          {placements.map((placement) => (
            <Tooltip
              key={placement}
              placement={placement}
              title={`${placement} 提示`}
              trigger="click"
            >
              <TouchableOpacity
                style={[
                  styles.placementButton,
                  {
                    backgroundColor: token.colorFillSecondary,
                    borderColor: token.colorBorder,
                  },
                ]}
              >
                <Text style={[styles.placementText, { color: token.colorText }]}>{placement}</Text>
              </TouchableOpacity>
            </Tooltip>
          ))}
        </View>
      </View>
    </View>
  );
};

export default PositionDemo;
