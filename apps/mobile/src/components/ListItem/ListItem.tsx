import { Link } from 'expo-router';

import { AVATAR_SIZE_MEDIUM } from '@/_const/common';

import Avatar from '../Avatar';
import Block from '../Block';
import Flexbox from '../Flexbox';
import Text from '../Text';
import type { ListItemProps } from './type';

const ListItem = ({ title, avatar, description, extra, onPress, href, active }: ListItemProps) => {
  const content = (
    <Block
      active={active}
      clickable
      gap={8}
      horizontal
      onPress={onPress}
      padding={12}
      style={{ borderRadius: 0 }}
      variant={'borderless'}
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
};

ListItem.displayName = 'ListItem';

export default ListItem;
