import auth from './auth';
import chat from './chat';
import common from './common';
import components from './components';
import discover from './discover';
import error from './error';
import providers from './providers';
import setting from './setting';
import tool from './tool';
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
  tool,
  topic,
  welcome,
} as const;

export default resources;
