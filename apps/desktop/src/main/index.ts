import log from 'electron-log';

import { App } from './core/App';

const app = new App();

log.info('----------------------------------------------');
log.info('[Main] Starting application...');
app.bootstrap();
