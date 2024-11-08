// import env
import { Crypto } from '@peculiar/webcrypto';
import * as dotenv from 'dotenv';

dotenv.config();

global.crypto = new Crypto();
