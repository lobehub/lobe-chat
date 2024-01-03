import { createStyles } from 'antd-style';
import React from 'react';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import SafeSpacing from '@/components/SafeSpacing';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Item from '../ChatItem';

const useStyles = createStyles(({ css }) => {
  return {
    container: css`
      position: relative;
      overflow: hidden auto;
      height: 100%;
    `,
  };
});

const VirtualizedList = () => {
  const { styles } = useStyles();

  const data = useChatStore(chatSelectors.currentChatIDsWithGuideMessage);

  return (
    <Flexbox className={styles.container}>
      <SafeSpacing />
      <Virtuoso
        data={data}
        followOutput={'smooth'}
        initialTopMostItemIndex={data?.length - 1}
        itemContent={(index, id) => <Item id={id} index={index} />}
      />
    </Flexbox>
  );
};

export default VirtualizedList;
