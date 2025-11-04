import { ChatToolPayload } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import ToolTitle from './Inspector/ToolTitle';
import ToolRender from './Render';

export interface ToolProps {
  apiName?: string;
  arguments?: string;
  id: string;
  identifier?: string;
  index: number;
  messageId: string;
  payload: ChatToolPayload;
  type?: string;
}

/**
 * Tool - 工具调用组件
 *
 * 显示工具标题和执行结果
 * 简化版：移除了交互功能（编辑、重新执行等）
 */
const Tool = memo<ToolProps>(({ id, apiName, identifier, arguments: args }) => {
  const { t } = useTranslation('tool');
  const [expanded, setExpanded] = useState(true);

  // 获取工具执行结果消息
  const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(id));

  const handleTitlePress = () => {
    // 如果是内置工具，切换展开/收起
    if (identifier === 'lobe-web-browsing' || identifier === 'lobe-local-system') {
      setExpanded(!expanded);
    } else {
      // 其他工具显示不支持提示
      Alert.alert(t('title'), t('mobileNotSupported'));
    }
  };

  return (
    <Flexbox gap={8}>
      {/* 工具标题 */}
      <Flexbox
        align="center"
        gap={4}
        horizontal
        justify="space-between"
        onPress={handleTitlePress}
        paddingBlock={4}
      >
        <ToolTitle apiName={apiName || ''} identifier={identifier || ''} />
      </Flexbox>

      {/* 工具渲染结果 */}
      {expanded && toolMessage && (
        <ToolRender
          apiName={apiName || ''}
          arguments={args}
          identifier={identifier || ''}
          pluginState={toolMessage.pluginState}
        />
      )}
    </Flexbox>
  );
});

Tool.displayName = 'AssistantTool';

export default Tool;
