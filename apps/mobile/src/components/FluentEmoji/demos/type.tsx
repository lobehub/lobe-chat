import { FluentEmoji, Text, useTheme } from '@lobehub/ui-rn';
import { View } from 'react-native';

import { type EmojiType } from '../utils';

const TypeDemo = () => {
  const token = useTheme();

  const emojiTypes: { label: string; type: EmojiType }[] = [
    { label: '3D', type: '3d' },
    { label: '动画', type: 'anim' },
    { label: '扁平', type: 'flat' },
    { label: '现代', type: 'modern' },
    { label: '单色', type: 'mono' },
    { label: '原生', type: 'pure' },
  ];

  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 24,
          justifyContent: 'center',
        }}
      >
        {emojiTypes.map(({ type, label }) => (
          <View key={type} style={{ alignItems: 'center' }}>
            <FluentEmoji emoji="🤯" size={48} type={type} />
            <Text
              style={{
                color: token.colorText,
                fontSize: 12,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
            <Text
              style={{
                color: token.colorTextSecondary,
                fontSize: 10,
                textAlign: 'center',
              }}
            >
              {type}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TypeDemo;
