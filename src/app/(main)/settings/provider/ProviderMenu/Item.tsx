import { ProviderIcon } from '@lobehub/icons';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ModelProviderCard } from '@/types/llm';

export const useStyles = createStyles(({ css, token }) => ({
  active: css`
    background: ${token.colorFillTertiary};
  `,
  container: css`
    cursor: pointer;

    padding-block: 8px;
    padding-inline: 12px;

    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: ${token.colorFillSecondary};
    }
  `,
}));

const ProviderItem = memo<ModelProviderCard>(({ id, name }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container} gap={8} horizontal>
      <ProviderIcon provider={id} size={24} style={{ borderRadius: 6 }} />
      {name}
    </Flexbox>
  );
});
export default ProviderItem;
