import { Block, Flexbox, TextArea } from '@lobehub/ui-rn';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, ViewStyle } from 'react-native';

import SenderBtn from '@/features/chat/actions/SenderBtn';
import { useChat } from '@/hooks/useChat';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import ModelSwitch from './components/ModelSwitch';

interface ChatInputProps {
  style?: ViewStyle;
}

const ChatInput = memo(({ style }: ChatInputProps) => {
  const { t } = useTranslation('chat');
  const { input, handleInputChange, handleSubmit } = useChat();
  useInitAgentConfig(); // 关键：触发agent配置加载

  const textAreaRef = useRef<TextInput>(null);

  const handleContainerPress = () => {
    textAreaRef.current?.focus();
  };

  const handleSend = () => {
    textAreaRef.current?.blur();
    handleSubmit();
  };

  return (
    <Flexbox height={'auto'} paddingInline={16} style={[{ paddingBottom: 16 }, style]}>
      <Block
        borderRadius={24}
        glass
        height={'auto'}
        onPress={handleContainerPress}
        pressEffect
        variant={'outlined'}
      >
        <TextArea
          numberOfLines={12}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSubmit}
          placeholder={t('placeholder', { ns: 'chat' })}
          ref={textAreaRef}
          style={{
            flex: 0,
            height: 'auto',
          }}
          value={input}
          variant={'borderless'}
        />
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'space-between'}
          onPress={handleContainerPress}
          onResponderRelease={(e) => e.stopPropagation()}
          onStartShouldSetResponder={() => true}
          paddingInline={8}
          style={{ paddingBottom: 8 }}
        >
          <Flexbox align={'center'} gap={8} horizontal justify={'flex-start'}>
            <ModelSwitch
              onPress={() => {
                textAreaRef.current?.blur();
              }}
            />
          </Flexbox>
          <Flexbox align={'center'} gap={8} horizontal justify={'flex-end'}>
            <SenderBtn onSend={handleSend} />
          </Flexbox>
        </Flexbox>
      </Block>
    </Flexbox>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
