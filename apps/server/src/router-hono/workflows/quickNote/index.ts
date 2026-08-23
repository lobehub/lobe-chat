import { Hono } from 'hono';

import { qstashAuth } from '../middlewares/qstashAuth';
import { onQuickNoteRunComplete } from './handlers/onRunComplete';
import { sweepQuickNoteDiscovery } from './handlers/sweep';

const app = new Hono();

app.post('/on-run-complete', qstashAuth(), onQuickNoteRunComplete);
app.post('/sweep', qstashAuth(), sweepQuickNoteDiscovery);

export default app;
