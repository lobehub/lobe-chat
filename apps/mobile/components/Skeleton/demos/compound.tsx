import React from 'react';
import { View, Text } from 'react-native';

import { useThemeToken } from '@/mobile/theme';
import Skeleton from '../index';

const CompoundDemo: React.FC = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: token.colorText, fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        Compound Components
      </Text>

      {/* Avatar Demo */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Skeleton.Avatar
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Default (Circle, 40px)
          </Text>
          <Skeleton.Avatar />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Large Circle (64px)
          </Text>
          <Skeleton.Avatar size={64} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Square Shape
          </Text>
          <Skeleton.Avatar shape="square" />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Animated
          </Text>
          <Skeleton.Avatar animated />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Multiple Sizes
          </Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <Skeleton.Avatar size={24} />
            <Skeleton.Avatar size={32} />
            <Skeleton.Avatar size={40} />
            <Skeleton.Avatar size={48} />
            <Skeleton.Avatar size={64} />
          </View>
        </View>
      </View>

      {/* Title Demo */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Skeleton.Title
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Default (60% width)
          </Text>
          <Skeleton.Title />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Full Width
          </Text>
          <Skeleton.Title width="100%" />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Fixed Width (200px)
          </Text>
          <Skeleton.Title width={200} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Animated
          </Text>
          <Skeleton.Title animated />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Different Widths
          </Text>
          <View style={{ gap: 8 }}>
            <Skeleton.Title width="80%" />
            <Skeleton.Title width="60%" />
            <Skeleton.Title width="40%" />
            <Skeleton.Title width="20%" />
          </View>
        </View>
      </View>

      {/* Paragraph Demo */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Skeleton.Paragraph
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Default (3 rows)
          </Text>
          <Skeleton.Paragraph />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Single Row
          </Text>
          <Skeleton.Paragraph rows={1} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Five Rows
          </Text>
          <Skeleton.Paragraph rows={5} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Custom Width (80%)
          </Text>
          <Skeleton.Paragraph width="80%" />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Different Width Per Row
          </Text>
          <Skeleton.Paragraph rows={4} width={['100%', '90%', '75%', '50%']} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Animated
          </Text>
          <Skeleton.Paragraph animated />
        </View>
      </View>

      {/* Combined Usage */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: token.colorText, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Combined Usage
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Profile Card Layout
          </Text>
          <View style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 12 }}>
            <Skeleton.Avatar size={48} />
            <View style={{ flex: 1 }}>
              <Skeleton.Title width="70%" />
              <Skeleton.Paragraph rows={2} width={['90%', '60%']} />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            Article Layout
          </Text>
          <View>
            <Skeleton.Title width="85%" />
            <View style={{ marginTop: 8 }}>
              <Skeleton.Paragraph rows={4} width={['100%', '95%', '88%', '65%']} />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: token.colorTextSecondary, fontSize: 14, marginBottom: 4 }}>
            List Item Layout
          </Text>
          <View style={{ gap: 16 }}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 12 }}>
                <Skeleton.Avatar shape="square" size={40} />
                <View style={{ flex: 1 }}>
                  <Skeleton.Title width="60%" />
                  <Skeleton.Paragraph rows={1} width="80%" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CompoundDemo;
