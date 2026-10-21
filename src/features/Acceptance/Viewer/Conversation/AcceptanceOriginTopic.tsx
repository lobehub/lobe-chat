'use client';

import { Flexbox, Icon } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { MessagesSquare } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useAcceptanceScope } from '../AcceptanceScope';
import { useAcceptanceBundle } from '../useAcceptanceBundle';
import { useOriginConversation } from './originConversation';

const styles = stylex.create({
  chip: {
    cursor: 'pointer',
    padding: '0',
    borderStyle: 'none',
    font: 'inherit',
    color: { 'default': cssVar.colorTextSecondary, ':hover': cssVar.colorText },
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    textDecoration: { 'default': null, ':hover': 'underline' },
  },
});

const AcceptanceOriginTopic = () => {
  const { t } = useTranslation('verify');
  const { acceptanceId, embedded } = useAcceptanceScope();
  const { data } = useAcceptanceBundle(acceptanceId);
  const originConversation = useOriginConversation();
  const openTopic = useCallback(() => {
    if (!originConversation || !data?.origin?.topic) return;
    originConversation.openTopicDrawer(data.origin.topic.id, {
      agentId: data.origin.agent?.id,
      title: data.origin.topic.title ?? data.subject.title ?? data.origin.topic.id,
    });
  }, [data, originConversation]);

  if (embedded || !data?.origin?.topic || !originConversation) return null;

  return (
    <button
      {...stylex.props(styles.chip)}
      title={t('acceptance.origin.openTopic')}
      type={'button'}
      onClick={openTopic}
    >
      <Flexbox horizontal align={'center'} gap={4}>
        <Icon icon={MessagesSquare} size={13} />
        {data.origin.topic.title ?? data.subject.title ?? data.origin.topic.id}
      </Flexbox>
    </button>
  );
};

export default AcceptanceOriginTopic;
