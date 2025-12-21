import { ProviderIcon } from '@lobehub/icons';
import { Avatar, Center, Flexbox } from '@lobehub/ui';
import { Badge } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

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

interface ProviderItemProps extends AiProviderListItem {
  onClick: (id: string) => void;
}

const ProviderItem = memo<ProviderItemProps>(
  ({ id, name, source, enabled, logo, onClick = () => {} }) => {
    const { styles, cx } = useStyles();
    const location = useLocation();

    // Extract providerId from pathname: /settings/provider/xxx -> xxx
    const activeKey = useMemo(() => {
      const pathParts = location.pathname.split('/');
      // pathname is like /settings/provider/all or /settings/provider/openai
      if (pathParts.length >= 4 && pathParts[2] === 'provider') {
        return pathParts[3];
      }
      return null;
    }, [location.pathname]);

    const isCustom = source === AiProviderSourceEnum.Custom;
    return (
      <div
        className={cx(styles.container, activeKey === id && styles.active)}
        onClick={() => {
          onClick(id);
        }}
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
        <Flexbox horizontal>
          {enabled && (
            <Center width={24}>
              <Badge status="success" />
            </Center>
          )}
          {/* cloud slot */}

          {/* cloud slot */}
        </Flexbox>
      </div>
    );
  },
);
export default ProviderItem;
