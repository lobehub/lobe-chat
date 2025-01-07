import { isServerMode } from '@/const/version';

import Client from './Client';
import Server from './Server';

const ScreenLoading = () => (isServerMode ? <Server /> : <Client />);

ScreenLoading.displayName = 'ScreenLoading';

export default ScreenLoading;
