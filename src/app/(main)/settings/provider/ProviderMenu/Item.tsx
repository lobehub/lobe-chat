import { ProviderIcon } from '@lobehub/icons';
import { Avatar } from '@lobehub/ui';
import { Badge } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AiProviderListItem, AiProviderSourceEnum } from '@/types/aiProvider';

export const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorFillSecondary};
  `,
  container: css`
    cursor: pointer;

    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadius}px;

    color: inherit;

    transition: all 0.2s ease-in-out;

    &:hover {
      color: inherit;
      background-color: ${token.colorFill};
    }
  `,
}));

const ProviderItem = memo<AiProviderListItem>(({ id, name, source, enabled, logo }) => {
  const { styles, cx } = useStyles();
  const pathname = usePathname();

  const activeKey = pathname.split('/').pop();

  const isCustom = source === AiProviderSourceEnum.Custom;
  return (
    <Link
      className={cx(styles.container, activeKey === id && styles.active)}
      href={`/settings/provider/${id}`}
    >
      <Flexbox gap={8} horizontal>
        {isCustom && logo ? (
          <Avatar
            alt={name || id}
            avatar={logo}
            shape={'square'}
            size={24}
            style={{ borderRadius: 6 }}
          />
        ) : (
          <ProviderIcon provider={id} size={24} style={{ borderRadius: 6 }} type={'avatar'} />
        )}
        {name}
      </Flexbox>
      {enabled && <Badge status="success" />}
    </Link>
  );
});
export default ProviderItem;
