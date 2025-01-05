import {
    ActionEvent,
    ActionIcon,
    ActionIconGroup,
    type ActionIconGroupProps,
    List,
} from '@lobehub/ui';
import { Copy, RotateCw, Unlink } from 'lucide-react';
import { type AdapterAccount } from 'next-auth/adapters';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { userService } from '@/services/user';

const { Item } = List;

const handleActionClick = (e: ActionEvent, item: AdapterAccount) => {
    console.log(e, item);
};

export const SSOProvidersList = memo(() => {
    const { data, isLoading } = useOnlyFetchOnceSWR('profile-sso-providers', async () =>
        userService.getUserSSOProviders(),
    );
    return (
        <>
            {isLoading ? (
                <Flexbox align={'center'} gap={4} horizontal>
                    <ActionIcon icon={RotateCw} spin />
                    {'stats.modelsRank.loading'}
                </Flexbox>
            ) : (
                <Flexbox>
                    {data?.map((item, index) => {
                        const dropdownMenu: ActionIconGroupProps['dropdownMenu'] = [
                            {
                                icon: Copy,
                                key: 'copy',
                                label: 'copy',
                            },
                            {
                                icon: Unlink,
                                key: 'unlink',
                                label: 'unlink',
                            },
                        ];
                        return (
                            <Item
                                actions={
                                    <ActionIconGroup
                                        dropdownMenu={dropdownMenu}
                                        onActionClick={(e) => handleActionClick(e, item)}
                                    />
                                }
                                date={item.expires_at}
                                description={item.providerAccountId}
                                key={index}
                                showAction={true}
                                title={item.provider}
                            />
                        );
                    })}
                </Flexbox>
            )}
        </>
    );
});

export default SSOProvidersList;
