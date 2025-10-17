import { Button, Flexbox, PageContainer, TextArea } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function DescriptionSetting() {
  const [loading, setLoading] = useState(false);
  const defaultDescription = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const [description, setDescription] = useState(defaultDescription || '');
  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            setLoading(true);
            console.log(description);
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
      title={'描述'}
    >
      <Flexbox padding={16}>
        <TextArea
          defaultValue={defaultDescription || ''}
          onChangeText={setDescription}
          value={description || ''}
        />
      </Flexbox>
    </PageContainer>
  );
}
