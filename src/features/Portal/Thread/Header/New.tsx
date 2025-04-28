import { Icon } from '@lobehub/ui';
import { Switch, Typography } from 'antd';
import { GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { portalThreadSelectors } from '@/store/chat/selectors';
import { oneLineEllipsis } from '@/styles';
import { ThreadType } from '@/types/topic';

const NewThreadHeader = () => {
  const { t } = useTranslation('thread');

  const [newThreadMode] = useChatStore((s) => [portalThreadSelectors.newThreadMode(s)]);

  return (
    <Flexbox align={'center'} gap={8} horizontal style={{ marginInlineStart: 4 }}>
      <Icon icon={GitBranch} size={18} />
      <Typography.Text className={oneLineEllipsis} ellipsis={true} style={{ fontSize: 14 }}>
        {t('newPortalThread.title')}
      </Typography.Text>
      <Flexbox align={'center'} gap={8} horizontal>
        <Switch
          checked={newThreadMode === ThreadType.Continuation}
          onChange={(e) => {
            useChatStore.setState({
              newThreadMode: e ? ThreadType.Continuation : ThreadType.Standalone,
            });
          }}
          size={'small'}
          style={{ marginInlineStart: 12 }}
        />
        {t('newPortalThread.includeContext')}
      </Flexbox>
    </Flexbox>
  );
};

export default NewThreadHeader;
