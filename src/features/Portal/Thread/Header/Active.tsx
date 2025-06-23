import { Icon, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ListTree } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { portalThreadSelectors } from '@/store/chat/selectors';
import { oneLineEllipsis } from '@/styles';

const Active = memo(() => {
  const theme = useTheme();
  const currentThread = useChatStore(portalThreadSelectors.portalCurrentThread, isEqual);

  return (
    currentThread && (
      <Flexbox align={'center'} gap={8} horizontal style={{ marginInlineStart: 4 }}>
        <Icon color={theme.colorTextSecondary} icon={ListTree} size={18} />
        <Text
          className={oneLineEllipsis}
          ellipsis={true}
          style={{ color: theme.colorTextSecondary, fontSize: 14 }}
        >
          {currentThread?.title === LOADING_FLAT ? (
            <Flexbox flex={1} height={30} justify={'center'}>
              <BubblesLoading />
            </Flexbox>
          ) : (
            currentThread?.title
          )}
        </Text>
      </Flexbox>
    )
  );
});

export default Active;
