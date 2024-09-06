import Pino from 'pino';

export const pino = Pino({
  level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
});
