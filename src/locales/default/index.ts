import tool from '../default/tool';
import auth from './auth';
import chat from './chat';
import clerk from './clerk';
import common from './common';
import components from './components';
import error from './error';
import market from './market';
import metadata from './metadata';
import migration from './migration';
import modelProvider from './modelProvider';
import plugin from './plugin';
import setting from './setting';
import welcome from './welcome';

const resources = {
  auth,
  chat,
  clerk,
  common,
  components,
  error,
  market,
  metadata,
  migration,
  modelProvider,
  plugin,
  setting,
  tool,
  welcome,
} as const;

export default resources;
