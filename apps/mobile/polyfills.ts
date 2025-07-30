// 导入buffer库，这可能也是nanoid等库需要的
import { Buffer } from 'node:buffer';
// 确保nanoid库可以使用crypto
import crypto from 'expo-crypto';
import 'react-native-get-random-values';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
if (typeof global.crypto === 'undefined') {
  // @ts-ignore
  global.crypto = crypto;
}
