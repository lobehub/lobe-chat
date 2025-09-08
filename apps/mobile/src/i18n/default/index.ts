import auth from './auth';
import chat from './chat';
import common from './common';
import discover from './discover';
import error from './error';
import setting from './setting';
import topic from './topic';
import welcome from './welcome';
import providers from './providers';
import components from './components';

const resources = {
  auth,
  chat,
  common,
  components,
  discover,
  error,
  providers,
  setting,
  topic,
  welcome,
} as const;

export default resources;
