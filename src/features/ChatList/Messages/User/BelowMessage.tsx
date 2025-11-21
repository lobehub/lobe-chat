import { ActionIcon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { RotateCwIcon, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, cx }) => ({
  action: cx(
    css`
      align-self: flex-end;
      opacity: 0;
    `,
    'rag-query-actions',
  ),
  container: css`
    &:hover {
      .rag-query-actions {
        opacity: 1;
      }
    }
  `,
  content: css`
    overflow-y: scroll;
    flex-wrap: wrap;

    width: 100%;
    max-height: 54px;
    margin-block-start: 6px;
  `,
}));

interface UserBelowMessageProps {
  content: string;
  id: string;
  ragQuery?: string | null;
}

export const UserBelowMessage = memo<UserBelowMessageProps>(({ ragQuery, content, id }) => {
  const { styles } = useStyles();

  const { t } = useTranslation('chat');

  const [deleteUserMessageRagQuery, rewriteQuery] = useChatStore((s) => [
    s.deleteUserMessageRagQuery,
    s.rewriteQuery,
  ]);

  return (
    !!ragQuery &&
    !isEqual(ragQuery, content) && (
      <Flexbox className={styles.container}>
        <Flexbox align={'center'} className={styles.content} gap={4} horizontal>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            {ragQuery}
          </Text>
        </Flexbox>
        <Flexbox className={styles.action} horizontal>
          <ActionIcon
            icon={Trash2}
            onClick={() => {
              deleteUserMessageRagQuery(id);
            }}
            size={'small'}
            title={t('rag.userQuery.actions.delete')}
          />
          <ActionIcon
            icon={RotateCwIcon}
            onClick={() => {
              rewriteQuery(id);
            }}
            size={'small'}
            title={t('rag.userQuery.actions.regenerate')}
          />
        </Flexbox>
      </Flexbox>
    )
  );
});
