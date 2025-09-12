import React from 'react';
import { ScrollView, View, Text } from 'react-native';

import { useThemeToken } from '@/theme';

const TokenDemo = () => {
  const token = useThemeToken();

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }} style={{ flex: 1 }}>
      <View style={{ gap: 16 }}>
        <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold' }}>
          颜色级别 Token 使用示例
        </Text>

        {/* Primary 颜色示例 */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>
            Primary 色系
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
              <View key={level} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: (token as any)[`primary${level}`],
                    borderRadius: 4,
                    height: 32,
                    marginBottom: 4,
                    width: 32,
                  }}
                />
                <Text style={{ color: token.colorTextSecondary, fontSize: 10 }}>
                  primary{level}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Red 颜色示例 */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>Red 色系</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((level) => (
              <View key={level} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: (token as any)[`red${level}`],
                    borderRadius: 4,
                    height: 32,
                    marginBottom: 4,
                    width: 32,
                  }}
                />
                <Text style={{ color: token.colorTextSecondary, fontSize: 10 }}>red{level}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 透明色示例 */}
        <View style={{ gap: 8 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>
            透明色系 (Alpha)
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[1, 3, 5, 7, 9, 11].map((level) => (
              <View key={level} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: (token as any)[`primary${level}A`],
                    borderColor: token.colorBorder,
                    borderRadius: 4,
                    borderWidth: 1,
                    height: 32,
                    marginBottom: 4,
                    width: 32,
                  }}
                />
                <Text style={{ color: token.colorTextSecondary, fontSize: 10 }}>
                  primary{level}A
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 使用说明 */}
        <View style={{ gap: 8, marginTop: 16 }}>
          <Text style={{ color: token.colorText, fontSize: 16, fontWeight: '600' }}>使用说明</Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, lineHeight: 20 }}>
            现在你可以直接使用以下颜色 token：{'\n'}• token.primary1 ~ token.primary11{'\n'}•
            token.red1A ~ token.red11A{'\n'}• token.blue1Dark ~ token.blue11Dark{'\n'}•
            token.green1DarkA ~ token.green11DarkA{'\n'}
            等等，支持所有颜色类型的所有级别
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default TokenDemo;
