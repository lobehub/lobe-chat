import { ProviderIcon } from '@lobehub/icons';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';

import { ModelProviderCard } from '@/types/llm';

export const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorFillTertiary};
  `,
  container: css`
    cursor: pointer;

    display: flex;
    gap: 8px;
    padding-block: 8px;
    padding-inline: 12px;

    color: inherit;
    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease-in-out;

    &:hover {
      color: inherit;
      background-color: ${token.colorFillSecondary};
    }
  `,
}));

const ProviderItem = memo<ModelProviderCard>(({ id, name }) => {
  const { styles } = useStyles();
  return (
    <Link className={styles.container} href={`/settings/provider/${id}`}>
      <ProviderIcon provider={id} size={24} style={{ borderRadius: 6 }} />
      {name}
    </Link>
  );
});
export default ProviderItem;
