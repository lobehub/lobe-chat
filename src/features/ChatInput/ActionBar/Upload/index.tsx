import { isServerMode } from '@/const/version';

import ClientMode from './ClientMode';
import ServerMode from './ServerMode';

const Upload = isServerMode ? ServerMode : ClientMode;

export default Upload;
