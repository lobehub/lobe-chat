import { Link } from 'expo-router';
import { memo } from 'react';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';

import Avatar from '../Avatar';
import Block from '../Block';
import Flexbox from '../Flexbox';
import Text from '../Text';
import type { ListItemProps } from './type';

const ListItem = memo<ListItemProps>(
  ({
    variant = 'borderless',
    title,
    avatar,
    description,
    extra,
    onPress,
    href,
    active,
    ...rest
  }) => {
    const content = (
      <Block
        active={active}
        gap={8}
        horizontal
        onPress={onPress}
        padding={12}
        pressEffect
        style={{ borderRadius: 0 }}
        variant={variant}
        {...rest}
      >
        {avatar && <Avatar avatar={avatar} size={AVATAR_SIZE_MEDIUM} />}
        <Flexbox align={'flex-start'} flex={1} gap={6} justify={'center'}>
          <Text ellipsis fontSize={16} weight={500}>
            {title}
          </Text>
          <Text ellipsis fontSize={12} type={'secondary'}>
            {description}
          </Text>
        </Flexbox>
        {extra && <Text>{extra}</Text>}
      </Block>
    );

    if (href) {
      return (
        <Link asChild href={href}>
          {content}
        </Link>
      );
    }

    return content;
  },
);

ListItem.displayName = 'ListItem';

export default ListItem;
