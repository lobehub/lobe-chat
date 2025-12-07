import { Block, Tag, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import HashTags from '../HashTags';
import Time from '../Time';
import { useCateColor } from '../useCateColor';

const ACTION_CLASSNAME = 'memory-masonry-actions';

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    transition: opacity 0.15s ease;
  `,
  masonryCard: css`
    cursor: pointer;
    position: relative;
    background: ${token.colorFillQuaternary};
    box-shadow: 0 0 0 1px ${token.colorFillTertiary} inset;
    .${ACTION_CLASSNAME} {
      opacity: 0;
    }

    &:hover {
      .${ACTION_CLASSNAME} {
        opacity: 1;
      }
    }
  `,
}));

interface MasonryCardProps {
  actions?: ReactNode;
  badges?: ReactNode;
  cate?: string | null;
  children?: ReactNode;
  footer?: ReactNode;
  hashTags?: string[] | null;
  onClick?: () => void;
  title?: ReactNode;
  titleAddon?: ReactNode;
  updatedAt?: Date | number | string;
}

const MasonryCard = memo<MasonryCardProps>(
  ({
    title,
    titleAddon,
    cate,
    children,
    actions,
    onClick,
    hashTags,
    badges,
    footer,
    updatedAt,
  }) => {
    const { theme, cx, styles } = useStyles();
    const cateColor = useCateColor(cate);
    return (
      <Block
        className={styles.masonryCard}
        gap={4}
        onClick={onClick}
        padding={4}
        style={{
          background: cateColor?.backgroundColor,
        }}
        variant={'filled'}
      >
        <Block
          gap={12}
          paddingBlock={16}
          paddingInline={12}
          style={{
            boxShadow: `0 4px 16px -4px ${cateColor?.shadowColor || 'rgba(0, 0, 0, 0.2)'}`,
            overflow: 'hidden',
            position: 'relative',
          }}
          variant={'outlined'}
        >
          {(title || titleAddon) && (
            <>
              <Flexbox align={'center'} gap={8} horizontal wrap={'wrap'}>
                {title && typeof title === 'string' ? (
                  <Text as={'h2'} fontSize={16} style={{ lineHeight: 1.5, margin: 0 }} weight={500}>
                    {title}
                  </Text>
                ) : (
                  title
                )}
              </Flexbox>
              {typeof titleAddon === 'string' ? (
                <Tag variant="borderless">{titleAddon}</Tag>
              ) : (
                titleAddon
              )}
            </>
          )}
          {typeof children === 'string' ? (
            <Text as={'p'} color={theme.colorTextSecondary}>
              {children}
            </Text>
          ) : (
            children
          )}
          <HashTags hashTags={hashTags} />
          <Flexbox
            align={'center'}
            gap={12}
            horizontal
            justify={'space-between'}
            style={{
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {footer}
            <Time updatedAt={updatedAt} />
          </Flexbox>
        </Block>
        <Flexbox
          align={'center'}
          horizontal
          justify={'space-between'}
          paddingBlock={8}
          paddingInline={8}
          style={{ overflow: 'hidden', position: 'relative' }}
          width={'100%'}
        >
          <Flexbox
            align={'center'}
            flex={1}
            gap={8}
            horizontal
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{
              overflow: 'hidden',
            }}
          >
            {badges}
          </Flexbox>
          <Center flex={'none'}>
            <Text
              align={'center'}
              color={cateColor?.backgroundTextColor || theme.colorTextSecondary}
              style={{
                opacity: 0.5,
              }}
              weight={'bold'}
            >
              {cate?.toUpperCase() || 'CHORE'}
            </Text>
          </Center>
          <Flexbox
            align={'center'}
            className={cx(ACTION_CLASSNAME, styles.actions)}
            flex={1}
            gap={4}
            horizontal
            justify={'flex-end'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{
              overflow: 'hidden',
            }}
          >
            {actions}
          </Flexbox>
        </Flexbox>
      </Block>
    );
  },
);

export default MasonryCard;
