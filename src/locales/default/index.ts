import tool from '../default/tool';
import chat from './chat';
import common from './common';
import components from './components';
import error from './error';
import market from './market';
import migration from './migration';
import modelProvider from './modelProvider';
import plugin from './plugin';
import setting from './setting';
import welcome from './welcome';

const resources = {
  chat,
  common,
  components,
  error,
  market,
  migration,
  modelProvider,
  plugin,
  setting,
  tool,
  welcome,
} as const;

export default resources;
