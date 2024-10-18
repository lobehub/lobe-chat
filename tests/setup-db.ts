// import env
import { Crypto } from '@peculiar/webcrypto';
import * as dotenv from 'dotenv';

dotenv.config();

Object.defineProperty(global, 'crypto', {
  configurable: true,
  value: new Crypto(),
});
