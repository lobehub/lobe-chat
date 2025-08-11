import {} from 'react-i18next';
import { View } from 'react-native';

import { useStyles } from './style';

import Header from './components/Header';
import Footer from './components/Footer';
import SessionList from './components/SessionList';

export default function SideBar() {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      <Header />
      <SessionList />
      <Footer />
    </View>
  );
}
