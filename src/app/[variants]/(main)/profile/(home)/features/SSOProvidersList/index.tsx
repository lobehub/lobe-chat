import { ActionIcon, CopyButton, List } from '@lobehub/ui';
import { RotateCw, Unlink } from 'lucide-react';
import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { modal, notification } from '@/components/AntdStaticMethods';
import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import AuthIcons from '@/components/NextAuth/AuthIcons';

const { Item } = List;

const providerNameStyle: CSSProperties = {
  textTransform: 'capitalize',
};

export const SSOProvidersList = memo(() => {
  const [userProfile] = useUserStore((s) => [userProfileSelectors.userProfile(s)]);
  const { t } = useTranslation('auth');

  const [allowUnlink, setAllowUnlink] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { data, isLoading, mutate } = useOnlyFetchOnceSWR('profile-sso-providers', async () => {
    const list = await userService.getUserSSOProviders();
    setAllowUnlink(list?.length > 1);
    return list;
  });

  const handleUnlinkSSO = async (provider: string, providerAccountId: string) => {
    if (data?.length === 1 || !data) {
      // At least one SSO provider should be linked
      notification.error({
        message: t('profile.sso.unlink.forbidden'),
      });
      return;
    }
    modal.confirm({
      content: t('profile.sso.unlink.description', {
        email: userProfile?.email || 'None',
        provider,
        providerAccountId,
      }),
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        await userService.unlinkSSOProvider(provider, providerAccountId);
        mutate();
      },
      title: <span style={providerNameStyle}>{t('profile.sso.unlink.title', { provider })}</span>,
    });
  };

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
              <ActionIcon
                disable={!allowUnlink}
                icon={Unlink}
                onClick={() => handleUnlinkSSO(item.provider, item.providerAccountId)}
                size={'small'}
              />
            </Flexbox>
          }
          avatar={AuthIcons(item.provider)}
          date={item.expires_at}
          description={item.providerAccountId}
          key={index}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          showAction={hoveredIndex === index}
          title={<span style={providerNameStyle}>{item.provider}</span>}
        />
      ))}
    </Flexbox>
  );
});

export default SSOProvidersList;
