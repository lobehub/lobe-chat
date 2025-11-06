import { Block, Flexbox, TextArea } from '@lobehub/ui-rn';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { type PressableProps, TextInput, ViewStyle } from 'react-native';

import { useChat } from '@/hooks/useChat';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import FilePreview from './components/FilePreview';
import FileUpload from './components/FileUpload';
import ModelSwitch from './components/ModelSwitch';
import SendButton from './components/SendButton';

interface ChatInputProps {
  style?: ViewStyle;
}

const ChatInput = memo<ChatInputProps>(({ style }) => {
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

  const handleActionButtonPress: PressableProps['onPress'] = (e) => {
    e.stopPropagation();
    textAreaRef.current?.blur();
  };

  return (
    <Flexbox height={'auto'} paddingInline={16} style={[{ paddingBottom: 16 }, style]}>
      {/* File Preview - show uploaded files */}
      <FilePreview />

      {/* Input Container */}
      <Block
        borderRadius={24}
        glass
        height={'auto'}
        onPress={handleContainerPress}
        pressEffect={false}
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
            <ModelSwitch onPress={handleActionButtonPress} />
            <FileUpload onPress={handleActionButtonPress} />
          </Flexbox>
          <Flexbox align={'center'} gap={8} horizontal justify={'flex-end'}>
            <SendButton onSend={handleSend} />
          </Flexbox>
        </Flexbox>
      </Block>
    </Flexbox>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
