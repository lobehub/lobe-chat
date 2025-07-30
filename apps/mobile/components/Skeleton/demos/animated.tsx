import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useThemeToken } from '@/mobile/theme';
import Skeleton from '../index';

const AnimatedDemo: React.FC = () => {
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [customColors, setCustomColors] = useState(false);
  const token = useThemeToken();

  const toggleAnimation = () => {
    setAnimationEnabled(!animationEnabled);
  };

  const toggleCustomColors = () => {
    setCustomColors(!customColors);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Animation Demo
      </Text>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={toggleAnimation}
          style={{
            alignItems: 'center',
            backgroundColor: animationEnabled ? token.colorPrimary : token.colorTextTertiary,
            borderRadius: 8,
            flex: 1,
            padding: 10,
          }}
        >
          <Text style={{ color: token.colorText, fontWeight: 'bold' }}>
            {animationEnabled ? 'Disable Animation' : 'Enable Animation'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleCustomColors}
          style={{
            alignItems: 'center',
            backgroundColor: customColors ? token.colorSuccess : token.colorTextTertiary,
            borderRadius: 8,
            flex: 1,
            padding: 10,
          }}
        >
          <Text style={{ color: token.colorText, fontWeight: 'bold' }}>
            {customColors ? 'Default Colors' : 'Custom Colors'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          {animationEnabled ? 'With Animation' : 'Without Animation'}
        </Text>
        <Skeleton animated={animationEnabled} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Large Avatar with {animationEnabled ? 'Animation' : 'No Animation'}
        </Text>
        <Skeleton animated={animationEnabled} avatar={{ size: 80 }} />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Complex Layout with {animationEnabled ? 'Shimmer' : 'Static'} Effect
        </Text>
        <Skeleton
          animated={animationEnabled}
          avatar={{ shape: 'square', size: 60 }}
          paragraph={{ rows: 4, width: ['100%', '95%', '85%', '60%'] }}
          title={{ width: '80%' }}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Side-by-Side Comparison
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: token.colorText, fontSize: 14, marginBottom: 8, textAlign: 'center' }}
            >
              Static
            </Text>
            <Skeleton animated={false} avatar={{ size: 40 }} paragraph={{ rows: 2 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: token.colorText, fontSize: 14, marginBottom: 8, textAlign: 'center' }}
            >
              Animated
            </Text>
            <Skeleton animated={true} avatar={{ size: 40 }} paragraph={{ rows: 2 }} />
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: token.colorFillSecondary,
          borderRadius: 8,
          marginTop: 10,
          padding: 12,
        }}
      >
        <Text style={{ color: token.colorTextSecondary, fontSize: 12, textAlign: 'center' }}>
          💡 Tip: Animation uses React Native&apos;s Animated API for smooth performance
        </Text>
      </View>
    </View>
  );
};

export default AnimatedDemo;
