import { SpotlightCardProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    overflow: hidden;
    background: ${token.colorBgContainer};
    border: 1px solid ${isDarkMode ? token.colorFillTertiary : token.colorFillSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,
}));

const AgentCard = memo<SpotlightCardProps>(({ items, renderItem, gap = 16, ...props }) => {
  const { styles } = useStyles();
  return (
    <Flexbox gap={gap} {...props}>
      {items.map((item, index) => {
        const children = renderItem(item);
        return (
          <div className={styles.container} key={index}>
            {children}
          </div>
        );
      })}
    </Flexbox>
  );
});

export default AgentCard;
