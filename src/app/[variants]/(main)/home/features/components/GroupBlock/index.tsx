import { Icon, IconProps, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, Suspense, memo, useState } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

interface GroupBlockProps extends Omit<FlexboxProps, 'title'> {
  action?: ReactNode;
  icon?: IconProps['icon'];
  title?: ReactNode;
}

const useStyles = createStyles(({ css, token }) => ({
  action: css`
    opacity: 0;
    transition: opacity ${token.motionDurationMid} ${token.motionEaseInOut};
  `,
  actionVisible: css`
    opacity: 1;
  `,
}));

const GroupBlock = memo<GroupBlockProps>(({ title, action, children, icon, ...rest }) => {
  const { styles, cx, theme } = useStyles();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Flexbox
      gap={16}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <Flexbox
          align={'center'}
          flex={1}
          gap={8}
          horizontal
          justify={'flex-start'}
          style={{ overflow: 'hidden' }}
        >
          <Icon color={theme.colorTextDescription} icon={icon} size={18} />
          <Text color={theme.colorTextSecondary} ellipsis>
            {title}
          </Text>
        </Flexbox>
        <Flexbox
          align={'center'}
          className={cx(styles.action, isHovered && styles.actionVisible)}
          flex={'none'}
          gap={2}
          horizontal
          justify={'flex-end'}
        >
          {action}
        </Flexbox>
      </Flexbox>
      <Suspense fallback={'loading'}>{children}</Suspense>
    </Flexbox>
  );
});

export default GroupBlock;
