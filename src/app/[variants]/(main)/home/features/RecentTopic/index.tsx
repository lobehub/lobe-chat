import { Flexbox } from 'react-layout-kit';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useInitRecentTopic } from '@/hooks/useInitRecentTopic';

const RecentTopic = memo(() => {
  const { t } = useTranslation('chat');
  const { data: recentTopics, isLoading } = useInitRecentTopic();

  if (isLoading) {
    return <div>{t('loading', { ns: 'common' })}</div>;
  }

  if (!recentTopics || recentTopics.length === 0) {
    return null;
  }

  return (
    <Flexbox gap={8} style={{ padding: 16 }}>
      <h3 style={{ margin: 0 }}>{t('topic.recent', { defaultValue: '最近话题' })}</h3>
      <Flexbox gap={8}>
        {recentTopics.map((topic) => (
          <Flexbox
            key={topic.id}
            style={{
              padding: 12,
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 500 }}>{topic.title}</div>
            {topic.updatedAt && (
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {new Date(topic.updatedAt).toLocaleDateString()}
              </div>
            )}
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default RecentTopic;
