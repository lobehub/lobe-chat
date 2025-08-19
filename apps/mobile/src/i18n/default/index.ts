import auth from './auth';
import chat from './chat';
import common from './common';
import discover from './discover';
import error from './error';
import setting from './setting';
import topic from './topic';

const resources = {
  auth,
  chat,
  common,
  discover,
  error,
  setting,
  topic,
} as const;

export default resources;
