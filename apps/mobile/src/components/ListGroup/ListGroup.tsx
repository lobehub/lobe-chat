import Flexbox from '../Flexbox';
import Text from '../Text';
import { useStyles } from './style';
import type { ListGroupProps } from './type';

const ListGroup = ({ children, style, title, ...rest }: ListGroupProps) => {
  const { styles } = useStyles();

  return (
    <Flexbox {...rest}>
      {title && (typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title)}
      <Flexbox style={[styles.container, style]}>{children}</Flexbox>
    </Flexbox>
  );
};

ListGroup.displayName = 'ListGroup';

export default ListGroup;
