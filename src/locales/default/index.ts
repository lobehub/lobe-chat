import tool from '../default/tool';
import auth from './auth';
import chat from './chat';
import clerk from './clerk';
import common from './common';
import components from './components';
import discover from './discover';
import error from './error';
import file from './file';
import knowledgeBase from './knowledgeBase';
import metadata from './metadata';
import migration from './migration';
import modelProvider from './modelProvider';
import plugin from './plugin';
import portal from './portal';
import ragEval from './ragEval';
import setting from './setting';
import welcome from './welcome';

const resources = {
  auth,
  chat,
  clerk,
  common,
  components,
  discover,
  error,
  file,
  knowledgeBase,
  metadata,
  migration,
  modelProvider,
  plugin,
  portal,
  ragEval,
  setting,
  tool,
  welcome,
} as const;

export default resources;
