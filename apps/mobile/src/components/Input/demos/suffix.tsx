import { Flexbox, Input, Text } from '@lobehub/ui-rn';
import { Copy, Send, X } from 'lucide-react-native';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';

const SuffixDemo = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Flexbox gap={16}>
      <Input placeholder="输入邮箱前缀" suffix={<Text>@gmail.com</Text>} />
      <Input
        placeholder="输入消息"
        suffix={
          <TouchableOpacity>
            <Send size={16} />
          </TouchableOpacity>
        }
      />
      <Input
        defaultValue="可复制的内容"
        suffix={
          <TouchableOpacity>
            <Copy size={16} />
          </TouchableOpacity>
        }
      />
      <Input
        onChangeText={setInputValue}
        placeholder="输入内容，支持清除"
        suffix={
          inputValue ? (
            <TouchableOpacity onPress={() => setInputValue('')}>
              <X size={16} />
            </TouchableOpacity>
          ) : null
        }
        value={inputValue}
      />
      <Input placeholder="搜索" prefix={<Text>🔍</Text>} suffix={<Text>⌘K</Text>} />
    </Flexbox>
  );
};

export default SuffixDemo;
