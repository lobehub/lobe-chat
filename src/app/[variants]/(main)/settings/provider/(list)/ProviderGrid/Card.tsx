import { ProviderCombine, ProviderIcon } from '@lobehub/icons';
import { Avatar, Text } from '@lobehub/ui';
import { Divider, Skeleton } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { AiProviderListItem } from '@/types/aiProvider';

import EnableSwitch from './EnableSwitch';
import { useStyles } from './style';

interface ProviderCardProps extends AiProviderListItem {
  loading?: boolean;
}
const ProviderCard = memo<ProviderCardProps>(
  ({ id, description, name, enabled, source, logo, loading }) => {
    const { t } = useTranslation('providers');
    const { cx, styles, theme } = useStyles();

    if (loading)
      return (
        <Flexbox className={cx(styles.container)} gap={24} padding={16}>
          <Skeleton active />
        </Flexbox>
      );

    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */

    return (
      <Flexbox className={cx(styles.container)} gap={24}>
        <Flexbox gap={12} padding={16} width={'100%'}>
          <Link href={`/settings/provider/${id}`}>
            <Flexbox gap={12} width={'100%'}>
              <Flexbox align={'center'} horizontal justify={'space-between'}>
                {source === 'builtin' ? (
                  <ProviderCombine
                    provider={id}
                    size={24}
                    style={{ color: theme.colorText }}
                    title={name}
                  />
                ) : (
                  <Flexbox align={'center'} gap={12} horizontal>
                    {logo ? (
                      <Avatar alt={name || id} avatar={logo} size={28} />
                    ) : (
                      <ProviderIcon
                        provider={id}
                        size={24}
                        style={{ borderRadius: 6 }}
                        type={'avatar'}
                      />
                    )}
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{name || id}</Text>
                  </Flexbox>
                )}
              </Flexbox>
              <Text
                className={styles.desc}
                ellipsis={{
                  rows: 2,
                }}
              >
                {source === 'custom' ? description : t(`${id}.description`)}
              </Text>
            </Flexbox>
          </Link>
          <Divider style={{ margin: '4px 0' }} />
          <Flexbox horizontal justify={'space-between'}>
            <div />
            <EnableSwitch enabled={enabled} id={id} />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ProviderCard;
