import { Button, Flexbox, Input, PageContainer, Toast } from '@lobehub/ui-rn';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loading as loadingService } from '@/libs/loading';
import { useChatStore } from '@/store/chat';

export default function TopicRenamePage() {
  const { t } = useTranslation('topic');
  const params = useLocalSearchParams<{ id: string; title: string }>();
  const updateTopicTitle = useChatStore((s) => s.updateTopicTitle);
  const [title, setTitle] = useState(params.title || '');
  const [loading, setLoading] = useState(false);

  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            if (title.trim().length === 0) {
              Toast.error(t('rename.emptyTitle'));
              return;
            }

            if (title.trim().length > 100) {
              Toast.error(t('rename.tooLong'));
              return;
            }

            setLoading(true);
            const { done } = loadingService.start();
            try {
              await updateTopicTitle(params.id, title.trim());
              Toast.success(t('rename.success'));
              done();
              router.back();
            } catch {
              Toast.error(t('rename.error'));
              done();
            } finally {
              setLoading(false);
            }
          }}
          size="small"
          type="primary"
        >
          {t('rename.done')}
        </Button>
      }
      showBack
      title={t('rename.title')}
    >
      <Flexbox padding={16}>
        <Input
          autoFocus
          defaultValue={params.title || ''}
          onChangeText={setTitle}
          placeholder={t('rename.placeholder')}
          value={title}
        />
      </Flexbox>
    </PageContainer>
  );
}
