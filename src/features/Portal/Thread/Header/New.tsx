import { Icon } from '@lobehub/ui';
import { Checkbox, Typography } from 'antd';
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
    <Flexbox>
      <Flexbox align={'center'} gap={8} horizontal style={{ marginInlineStart: 8 }}>
        <Icon icon={GitBranch} size={{ fontSize: 20 }} />
        <Typography.Text className={oneLineEllipsis} style={{ fontSize: 16, fontWeight: 'bold' }}>
          {t('newPortalThread.title')}
        </Typography.Text>
        <Checkbox
          checked={newThreadMode === ThreadType.Continuation}
          onChange={(e) => {
            useChatStore.setState({
              newThreadMode: e.target.checked ? ThreadType.Continuation : ThreadType.Standalone,
            });
          }}
          style={{ marginInlineStart: 12 }}
        >
          {t('newPortalThread.includeContext')}
        </Checkbox>
      </Flexbox>
    </Flexbox>
  );
};

export default NewThreadHeader;
