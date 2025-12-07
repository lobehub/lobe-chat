import { Block, Icon, Tag, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { HashIcon, Link2 } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

dayjs.extend(relativeTime);
const ACTION_CLASSNAME = 'memory-actions';

const useStyles = createStyles(({ css }) => ({
  actions: css`
    transition: opacity 0.15s ease;
  `,
  timelineCard: css`
    position: relative;
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

interface TimeLineCardProps {
  actions?: ReactNode;
  cate?: ReactNode;
  children?: ReactNode;
  hashTags?: string[] | null;
  onClick?: () => void;
  title?: ReactNode;
  titleAddon?: ReactNode;
  updatedAt?: Date | number | string;
}

const TimeLineCard = memo<TimeLineCardProps>(
  ({ title, titleAddon, cate, children, actions, onClick, updatedAt, hashTags }) => {
    const { theme, cx, styles } = useStyles();
    return (
      <Block
        className={styles.timelineCard}
        clickable
        gap={12}
        onClick={onClick}
        padding={16}
        variant={'borderless'}
      >
        {(title || titleAddon) && (
          <Flexbox
            align={'center'}
            gap={4}
            horizontal
            style={{
              overflow: 'hidden',
            }}
            width={'100%'}
            wrap={'wrap'}
          >
            {title && typeof title === 'string' ? (
              <Text as={'h2'} ellipsis fontSize={16} style={{ margin: 0 }} weight={500}>
                {title}
              </Text>
            ) : (
              title
            )}
            {typeof titleAddon === 'string' ? (
              <Tag icon={<Icon icon={Link2} />} variant="borderless">
                {titleAddon}
              </Tag>
            ) : (
              titleAddon
            )}
          </Flexbox>
        )}
        {typeof children === 'string' ? (
          <Text as={'p'} color={theme.colorTextSecondary} ellipsis={{ rows: 3 }}>
            {children}
          </Text>
        ) : (
          children
        )}
        {hashTags && hashTags.length > 0 && (
          <Flexbox gap={8} horizontal wrap="wrap">
            {hashTags.map((tag, index) => (
              <Tag
                icon={<Icon icon={HashIcon} />}
                key={index}
                style={{
                  color: theme.colorTextDescription,
                  gap: 2,
                  marginRight: 4,
                  paddingInline: 0,
                }}
                variant={'borderless'}
              >
                {tag}
              </Tag>
            ))}
          </Flexbox>
        )}
        <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
          <Flexbox align={'center'} gap={8} horizontal>
            {typeof cate === 'string' ? <Tag>{cate}</Tag> : cate}
            {updatedAt && (
              <Text
                fontSize={12}
                title={dayjs(updatedAt).format('YYYY-MM-DD HH:mm')}
                type={'secondary'}
              >
                {dayjs(updatedAt).fromNow()}
              </Text>
            )}
          </Flexbox>
          <Flexbox
            align={'center'}
            className={cx(ACTION_CLASSNAME, styles.actions)}
            gap={4}
            horizontal
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {actions}
          </Flexbox>
        </Flexbox>
      </Block>
    );
  },
);

export default TimeLineCard;
