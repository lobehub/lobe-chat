import { Flexbox, Tag } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { dataSelectors, useConversationStore } from '../../../store';
import UserMessageContent from '../../User/components/MessageContent';

const styles = stylex.create({
  bubble: {
    maxWidth: '100%',
    paddingBlock: '8px',
    paddingInline: '12px',
    borderRadius: '12px',
    backgroundColor: cssVar.colorFillTertiary,
    backgroundImage: 'none',
  },
});

interface SteerMessageProps {
  id: string;
}

const SteerMessage = memo<SteerMessageProps>(({ id }) => {
  const { t } = useTranslation('chat');
  const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual);

  if (!item) return null;

  return (
    <Flexbox align={'flex-end'} data-message-id={id} data-steer-message={id}>
      <Flexbox align={'flex-start'} className={stylex.props(styles.bubble).className} gap={4}>
        <Tag>{t('steer.tag')}</Tag>
        <UserMessageContent {...item} />
      </Flexbox>
    </Flexbox>
  );
});

SteerMessage.displayName = 'SteerMessage';

export default SteerMessage;
