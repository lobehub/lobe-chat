import auth from './auth';
import chat from './chat';
import common from './common';
import discover from './discover';
import error from './error';
import setting from './setting';

const resources = {
  auth,
  chat,
  common,
  discover,
  error,
  setting,
} as const;

export default resources;
