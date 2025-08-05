import React, { memo } from 'react';
import { View } from 'react-native';
import { Paperclip, Image, Eye, Globe, Atom, ToyBrick } from 'lucide-react-native';

import { Tag } from '@/components/Tag';
import { ModelAbilities } from '@/types/aiModel';
import { useStyles } from './styles';

// 简单的token数字格式化函数
const formatTokenNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

interface ModelInfoTagsProps extends ModelAbilities {
  contextWindowTokens?: number | null;
}

/**
 * 模型信息标签组件
 * 显示模型的各种能力标签，对齐Web端实现
 */
const ModelInfoTags = memo<ModelInfoTagsProps>((model) => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      {/* Files 支持 */}
      {model.files && (
        <View style={[styles.tag, styles.successTag]}>
          <Paperclip color={styles.successIcon.color} size={12} />
        </View>
      )}

      {/* Image Output 支持 */}
      {model.imageOutput && (
        <View style={[styles.tag, styles.successTag]}>
          <Image color={styles.successIcon.color} size={12} />
        </View>
      )}

      {/* Vision 支持 */}
      {model.vision && (
        <View style={[styles.tag, styles.successTag]}>
          <Eye color={styles.successIcon.color} size={12} />
        </View>
      )}

      {/* Function Call 支持 */}
      {model.functionCall && (
        <View style={[styles.tag, styles.infoTag]}>
          <ToyBrick color={styles.infoIcon.color} size={12} />
        </View>
      )}

      {/* Reasoning 支持 */}
      {model.reasoning && (
        <View style={[styles.tag, styles.purpleTag]}>
          <Atom color={styles.purpleIcon.color} size={12} />
        </View>
      )}

      {/* Search 支持 */}
      {model.search && (
        <View style={[styles.tag, styles.cyanTag]}>
          <Globe color={styles.cyanIcon.color} size={12} />
        </View>
      )}

      {/* Context Window Tokens */}
      {typeof model.contextWindowTokens === 'number' && (
        <Tag style={styles.tokenTag} textStyle={styles.tokenText}>
          {model.contextWindowTokens === 0 ? '∞' : formatTokenNumber(model.contextWindowTokens)}
        </Tag>
      )}
    </View>
  );
});

ModelInfoTags.displayName = 'ModelInfoTags';

export default ModelInfoTags;
