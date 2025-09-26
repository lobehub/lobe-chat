import { Button, Tooltip } from '@lobehub/ui-rn';
import type { TooltipPlacement } from '@lobehub/ui-rn';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

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
  placementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
});

const PositionDemo = () => {
  const token = useTheme();

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
              <Button size="small" type="default">
                {placement}
              </Button>
            </Tooltip>
          ))}
        </View>
      </View>
    </View>
  );
};

export default PositionDemo;
