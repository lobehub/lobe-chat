import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { GroupedTopic } from '@/types/topic';

const preformat = (id: string) =>
  id.startsWith('20') ? (id.includes('-') ? dayjs(id).format('MMMM') : id) : undefined;

const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    color: ${token.colorTextQuaternary};
    background: ${token.colorBgLayout};
    box-shadow: 0 3px 4px -2px ${token.colorBgLayout};

    ${responsive.mobile} {
      background: ${token.colorBgElevated};
      box-shadow: 0 3px 4px -2px ${token.colorBgElevated};
    }
  `,
}));

const TopicGroupItem = memo<Omit<GroupedTopic, 'children'>>(({ id, title }) => {
  const { t } = useTranslation('topic');
  const { styles } = useStyles();
  const timeTitle = preformat(id) ?? t(`groupTitle.byTime.${id}` as any);

  return (
    <Flexbox className={styles.container} paddingBlock={'12px 8px'} paddingInline={12}>
      {title ? title : timeTitle}
    </Flexbox>
  );
});
export default TopicGroupItem;
