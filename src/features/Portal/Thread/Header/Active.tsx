import { Icon } from '@lobehub/ui';
import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { ListTree } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { portalThreadSelectors } from '@/store/chat/selectors';
import { oneLineEllipsis } from '@/styles';

const Active = () => {
  const currentThread = useChatStore(portalThreadSelectors.portalCurrentThread, isEqual);

  return (
    currentThread && (
      <Flexbox align={'center'} gap={8} horizontal style={{ marginInlineStart: 8 }}>
        <Icon icon={ListTree} size={{ fontSize: 20 }} />

        <Typography.Text className={oneLineEllipsis} style={{ fontSize: 16, fontWeight: 'bold' }}>
          {currentThread?.title === LOADING_FLAT ? (
            <Flexbox flex={1} height={30} justify={'center'}>
              <BubblesLoading />
            </Flexbox>
          ) : (
            currentThread?.title
          )}
        </Typography.Text>
      </Flexbox>
    )
  );
};

export default Active;
