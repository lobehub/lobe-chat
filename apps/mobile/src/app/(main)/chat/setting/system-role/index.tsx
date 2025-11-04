import { Button, PageContainer, TextArea } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { loading } from '@/libs/loading';
import { agentSelectors, useAgentStore } from '@/store/agent';

export default function SystemRoleSetting() {
  const { t } = useTranslation('chat');

  const systemRole = useAgentStore(agentSelectors.currentAgentSystemRole);
  const updateAgentConfig = useAgentStore((s) => s.updateAgentConfig);

  const [editValue, setEditValue] = useState(systemRole || '');

  const textInputRef = useRef<TextInput>(null);

  const handleSave = useCallback(async () => {
    // 如果内容没有变化，直接返回
    if (editValue === systemRole) {
      router.back();
      return;
    }

    try {
      await loading.start(updateAgentConfig({ systemRole: editValue }));
      router.back();
    } catch (error) {
      console.error('Failed to update agent role:', error);
    }
  }, [editValue, systemRole, updateAgentConfig]);

  // 监听 systemRole 变化，同步更新编辑值
  useEffect(() => {
    setEditValue(systemRole || '');
  }, [systemRole]);

  return (
    <PageContainer
      extra={
        <Button onPress={handleSave} size={'small'} type={'primary'}>
          {t('setting.done')}
        </Button>
      }
      showBack
      title={t('agentRoleEdit.title')}
    >
      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        <TextArea
          autoFocus
          onChangeText={setEditValue}
          placeholder={t('agentRoleEdit.placeholder', { ns: 'chat' })}
          ref={textInputRef}
          style={{ flex: 1, minHeight: 200 }}
          value={editValue}
          variant={'borderless'}
        />
      </KeyboardAwareScrollView>
    </PageContainer>
  );
}
