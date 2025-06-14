import { CopyOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button } from '@lobehub/ui';
import { Flex, message } from 'antd';
import { FC, useState } from 'react';

interface ApiKeyDisplayProps {
  apiKey?: string;
}

const ApiKeyDisplay: FC<ApiKeyDisplayProps> = ({ apiKey }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleCopy = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      message.success('API Key 已复制到剪贴板');
    } catch {
      message.error('复制失败');
    }
  };

  const displayValue = apiKey && (isVisible ? apiKey : `lb-${'*'.repeat(apiKey.length - 2)}`);

  if (!apiKey) {
    return '自动生成';
  }

  return (
    <Flex align="center" gap={8}>
      <span style={{ fontSize: '14px' }}>{displayValue}</span>
      <Flex>
        <Button
          icon={isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={toggleVisibility}
          size="small"
          title={isVisible ? '隐藏' : '显示'}
          type="text"
        />
        <Button
          icon={<CopyOutlined />}
          onClick={handleCopy}
          size="small"
          title="复制"
          type="text"
        />
      </Flex>
    </Flex>
  );
};

export default ApiKeyDisplay;
