import { ChatToolPayload, ChatToolResult } from '@lobechat/types';
import { Flexbox, Icon } from '@lobehub/ui-rn';
import { Check, X } from 'lucide-react-native';
import { memo, useState } from 'react';

import { LOADING_FLAT } from '@/_const/message';
import { useTheme } from '@/components/styles';
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
  payload?: ChatToolPayload;
  result?: ChatToolResult;
  type?: string;
}

/**
 * Tool - 工具调用组件
 *
 * 显示工具标题和执行结果
 * 对齐桌面端：支持展开/收起、显示成功/失败状态
 */
const Tool = memo<ToolProps>(({ id, apiName, identifier, arguments: args, result }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // 如果没有传入 result，从 store 获取（兼容旧逻辑）
  const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(id));
  const finalResult: ChatToolResult | undefined =
    result ||
    (toolMessage
      ? {
          content: toolMessage.content,
          id: toolMessage.id,
          state: toolMessage.pluginState,
        }
      : undefined);

  // 判断工具是否有结果
  const hasError = !!finalResult?.error;
  const hasSuccessResult = !!finalResult?.content && finalResult.content !== LOADING_FLAT;
  const hasResult = hasSuccessResult || hasError;

  const handleTitlePress = () => {
    setExpanded(!expanded);
  };

  return (
    <Flexbox gap={8}>
      {/* 工具标题行 */}
      <Flexbox
        align="center"
        gap={8}
        horizontal
        justify="space-between"
        onPress={handleTitlePress}
        paddingBlock={4}
      >
        <ToolTitle apiName={apiName || ''} identifier={identifier || ''} />

        <Flexbox align="center" gap={4} horizontal>
          {/* 成功/失败状态图标 */}
          {hasResult && (
            <Icon
              color={hasError ? theme.colorError : theme.colorSuccess}
              icon={hasError ? X : Check}
              size={16}
            />
          )}
        </Flexbox>
      </Flexbox>

      {/* 工具渲染结果 */}
      {expanded && finalResult && (
        <ToolRender
          apiName={apiName || ''}
          arguments={args}
          identifier={identifier || ''}
          pluginState={finalResult.state || toolMessage?.pluginState}
        />
      )}
    </Flexbox>
  );
});

Tool.displayName = 'AssistantTool';

export default Tool;
