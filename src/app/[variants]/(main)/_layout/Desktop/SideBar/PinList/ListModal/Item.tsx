import { ActionIcon, Avatar, SortableList } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PinOff } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { sessionHelpers } from '@/store/session/helpers';
import { LobeAgentSession } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
  content: css`
    position: relative;
    overflow: hidden;
    flex: 1;
  `,
  title: css`
    flex: 1;
    height: 32px;
    line-height: 32px;
    text-align: start;
  `,
}));

const Item = memo<LobeAgentSession>((agent) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();

  return (
    <>
      <SortableList.DragHandle />
      <Flexbox align="center" gap={8} horizontal style={{ flex: 1 }}>
        <Avatar
          avatar={sessionHelpers.getAvatar(agent.meta)}
          background={agent.meta.backgroundColor}
          size={32}
        />
        <span className={styles.title}>{sessionHelpers.getTitle(agent.meta)}</span>
        <ActionIcon
          danger
          icon={PinOff}
          onClick={() => {
            console.log('Unpin session:', agent.id);
          }}
          size={'small'}
        />
      </Flexbox>
    </>
  );
});

export default Item;
