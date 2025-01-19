import { ActionIcon, CopyButton, List } from '@lobehub/ui';
import { Popconfirm } from 'antd';
import { RotateCw, Unlink } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { userService } from '@/services/user';

import AuthIcons from './AuthIcons';

const { Item } = List;

export const SSOProvidersList = memo(() => {
  const [allowUnlink, setAllowUnlink] = useState<boolean>(false);

  const { data, isLoading, mutate } = useOnlyFetchOnceSWR('profile-sso-providers', async () => {
    const list = await userService.getUserSSOProviders();
    setAllowUnlink(list?.length > 1);
    return list;
  });

  const handleUnlinkSSO = async (provider: string, providerAccountId: string) => {
    await userService.unlinkSSOProvider(provider, providerAccountId);
    mutate();
  };

  const { t } = useTranslation('auth');

  return isLoading ? (
    <Flexbox align={'center'} gap={4} horizontal>
      <ActionIcon icon={RotateCw} spin />
      {t('profile.sso.loading')}
    </Flexbox>
  ) : (
    <Flexbox>
      {data?.map((item, index) => (
        <Item
          actions={
            <Flexbox gap={4} horizontal>
              <CopyButton content={item.providerAccountId} size={'small'} />
              <Popconfirm
                onConfirm={() => handleUnlinkSSO(item.provider, item.providerAccountId)}
                placement="topRight"
                title={t('profile.sso.unlink', { provider: item.provider })}
              >
                <ActionIcon disable={!allowUnlink} icon={Unlink} size={'small'} />
              </Popconfirm>
            </Flexbox>
          }
          avatar={AuthIcons(item.provider)}
          date={item.expires_at}
          description={item.providerAccountId}
          key={index}
          showAction={true}
          title={<span style={{ textTransform: 'capitalize' }}>{item.provider}</span>}
        />
      ))}
    </Flexbox>
  );
});

export default SSOProvidersList;
