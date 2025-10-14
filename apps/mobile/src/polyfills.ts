// 确保nanoid库可以使用crypto
import crypto from 'expo-crypto';
import 'react-native-get-random-values';

if (typeof global.crypto === 'undefined') {
  // @ts-ignore
  global.crypto = crypto;
}
