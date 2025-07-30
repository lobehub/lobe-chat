import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useThemeToken } from '@/mobile/theme';
import Skeleton from '../index';

const ComplexDemo: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const token = useThemeToken();

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Complex Skeleton</Text>

      <TouchableOpacity
        onPress={toggleLoading}
        style={{
          alignItems: 'center',
          backgroundColor: token.colorPrimary,
          borderRadius: 8,
          marginBottom: 20,
          padding: 12,
        }}
      >
        <Text style={{ color: token.colorText, fontWeight: 'bold' }}>
          {loading ? 'Show Content' : 'Show Loading'}
        </Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>User Profile Card</Text>
        <Skeleton
          avatar={{ size: 64 }}
          loading={loading}
          paragraph={{ rows: 2, width: ['90%', '70%'] }}
          title={{ width: '40%' }}
        >
          <View style={{ alignItems: 'center', flexDirection: 'row' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: token.colorPrimary,
                borderRadius: 32,
                height: 64,
                justifyContent: 'center',
                width: 64,
              }}
            >
              <Text style={{ color: token.colorText, fontSize: 24, fontWeight: 'bold' }}>JD</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>John Doe</Text>
              <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 2 }}>
                Software Engineer
              </Text>
              <Text style={{ color: token.colorTextTertiary, fontSize: 12 }}>
                San Francisco, CA
              </Text>
            </View>
          </View>
        </Skeleton>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Article List</Text>
        <Skeleton
          avatar={{ shape: 'square', size: 48 }}
          loading={loading}
          paragraph={{ rows: 3 }}
          title={{ width: '70%' }}
        >
          <View style={{ alignItems: 'flex-start', flexDirection: 'row' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: token.colorFillSecondary,
                borderRadius: 4,
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}
            >
              <Text style={{ fontSize: 20 }}>📝</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                How to Build Great React Native Apps
              </Text>
              <Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>
                Learn the best practices for building performant and scalable React Native
                applications with modern tools and techniques.
              </Text>
            </View>
          </View>
        </Skeleton>
      </View>
    </View>
  );
};

export default ComplexDemo;
