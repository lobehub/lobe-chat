import { Button, Flexbox, Input, PageContainer } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function NameSetting() {
  const [loading, setLoading] = useState(false);
  const defaultTitle = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const [title, setTitle] = useState(defaultTitle || '');
  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            setLoading(true);
            // TODO: 增加保存逻辑
            setLoading(false);
            router.back();
          }}
          size={'small'}
          type={'primary'}
        >
          完成
        </Button>
      }
      showBack
      title={'名称'}
    >
      <Flexbox padding={16}>
        <Input defaultValue={defaultTitle || ''} onChangeText={setTitle} value={title || ''} />
      </Flexbox>
    </PageContainer>
  );
}
