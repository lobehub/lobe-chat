import { Linking } from 'react-native';

export default function openUrl(url: string) {
  if (url) {
    Linking.openURL(url);
  }
}
