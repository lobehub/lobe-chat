import { ActionIcon, List } from '@lobehub/ui';
import { RotateCw } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { userService } from '@/services/user';

const { Item } = List;

export const SSOSessionsList = memo(() => {
  const { data, isLoading } = useOnlyFetchOnceSWR('profile-sso-sessions', async () => {
    const list = await userService.getUserSSOSessions();
    console.log('SSO sessions', list);
    return list;
  });

  return isLoading ? (
    <Flexbox align={'center'} gap={4} horizontal>
      <ActionIcon icon={RotateCw} spin />
      {'活动的会话'}
    </Flexbox>
  ) : (
    <Flexbox>
      {data?.map((item, index) => (
        <Item
          date={item.expiresAt.getTime()}
          key={index.toString()}
          title={`有效期至：${item.expiresAt.toLocaleString()}`}
        />
      ))}
    </Flexbox>
  );
});

export default SSOSessionsList;
