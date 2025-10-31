import type { GroupedTopic } from '@lobechat/types';
import dayjs from 'dayjs';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Flexbox from '@/components/Flexbox';
import Text from '@/components/Text';

const preformat = (id: string) =>
  id.startsWith('20') ? (id.includes('-') ? dayjs(id).format('MMMM') : id) : undefined;

/**
 * GroupItem - 时间分组的标题组件
 * 显示分组名称（收藏、今天、昨天、本周等）
 */
const GroupItem = memo<Omit<GroupedTopic, 'children'>>(({ id, title }) => {
  const { t } = useTranslation('topic');

  const timeTitle = preformat(id) ?? t(`groupTitle.byTime.${id}` as any);

  return (
    <Flexbox paddingBlock={8} paddingInline={12}>
      <Text fontSize={12} type="secondary">
        {title ? title : timeTitle}
      </Text>
    </Flexbox>
  );
});

GroupItem.displayName = 'GroupItem';

export default GroupItem;
