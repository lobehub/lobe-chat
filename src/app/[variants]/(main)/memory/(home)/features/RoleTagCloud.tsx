import { createStyles } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  expandButton: css`
    cursor: pointer;
    margin-block-start: 8px;
    font-size: 12px;
    color: ${token.colorTextTertiary};

    &:hover {
      color: ${token.colorText};
    }
  `,
  tagCloud: css`
    padding: 16px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
  tagCloudCollapsed: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  `,
  tagItem: css`
    cursor: default;

    display: inline-block;

    margin: 4px;
    padding-block: 4px;
    padding-inline: 12px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 13px;
    color: ${token.colorTextSecondary};

    background: ${token.colorBgContainer};

    transition: all 0.15s ease;

    &:hover {
      color: ${token.colorText};
      background: ${token.colorBgElevated};
    }
  `,
}));

interface RoleTagCloudProps {
  roles: string[];
}

const RoleTagCloud = memo<RoleTagCloudProps>(({ roles }) => {
  const { styles, cx } = useStyles();
  const { t } = useTranslation('memory');
  const [expanded, setExpanded] = useState(false);

  if (roles.length === 0) return null;

  const needsExpansion = roles.length > 15;

  return (
    <Flexbox>
      <div className={cx(styles.tagCloud, !expanded && needsExpansion && styles.tagCloudCollapsed)}>
        {roles.map((role) => (
          <span className={styles.tagItem} key={role}>
            {role}
          </span>
        ))}
      </div>
      {needsExpansion && (
        <Flexbox
          align="center"
          className={styles.expandButton}
          gap={4}
          horizontal
          justify="flex-end"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              {t('identity.roleCloud.collapse')}
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              {t('identity.roleCloud.expand')}
              <ChevronDown size={14} />
            </>
          )}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default RoleTagCloud;
