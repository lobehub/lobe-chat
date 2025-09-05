import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Copy, Send, X } from 'lucide-react-native';

import TextInput from '../index';
import { createStyles } from '@/theme';

const useStyles = createStyles((token) => ({
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: token.paddingXXS,
  },
  container: {
    gap: token.marginSM,
    padding: token.paddingLG,
  },
  suffixButton: {
    alignItems: 'center',
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusSM,
    justifyContent: 'center',
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS,
  },
  suffixText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
  },
}));

const SuffixDemo = () => {
  const { styles, token } = useStyles();
  const [inputValue, setInputValue] = React.useState('');

  return (
    <View style={styles.container}>
      {/* 基础后缀文本 */}
      <TextInput
        placeholder="输入邮箱前缀"
        suffix={<Text style={styles.suffixText}>@gmail.com</Text>}
      />

      {/* 后缀按钮 */}
      <TextInput
        placeholder="输入消息"
        suffix={
          <TouchableOpacity style={styles.suffixButton}>
            <Send color={token.colorText} size={16} />
          </TouchableOpacity>
        }
      />

      {/* 复制按钮后缀 */}
      <TextInput
        defaultValue="可复制的内容"
        suffix={
          <TouchableOpacity style={styles.clearButton}>
            <Copy color={token.colorTextSecondary} size={16} />
          </TouchableOpacity>
        }
      />

      {/* 清除按钮后缀 */}
      <TextInput
        onChangeText={setInputValue}
        placeholder="输入内容，支持清除"
        suffix={
          inputValue ? (
            <TouchableOpacity onPress={() => setInputValue('')} style={styles.clearButton}>
              <X color={token.colorTextSecondary} size={16} />
            </TouchableOpacity>
          ) : null
        }
        value={inputValue}
      />

      {/* 前缀和后缀组合 */}
      <TextInput
        placeholder="搜索"
        prefix={<Text style={styles.suffixText}>🔍</Text>}
        suffix={<Text style={styles.suffixText}>⌘K</Text>}
      />
    </View>
  );
};

export default SuffixDemo;
