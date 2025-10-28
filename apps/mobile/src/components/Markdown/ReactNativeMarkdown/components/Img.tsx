import { memo } from 'react';
import FitImage from 'react-native-fit-image';

import { useStyles } from '../style';

const Img = memo<{ src?: string }>(({ src }) => {
  const { styles } = useStyles();
  return <FitImage source={{ uri: src }} style={styles.img} />;
});

export default Img;
