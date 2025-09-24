import auth from './auth';
import chat from './chat';
import common from './common';
import components from './components';
import discover from './discover';
import error from './error';
import providers from './providers';
import setting from './setting';
import topic from './topic';
import welcome from './welcome';

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
