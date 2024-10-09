import { isCustomBranding } from '@/const/version';

import tool from '../default/tool';
import auth from './auth';
import chat from './chat';
import clerk from './clerk';
import common from './common';
import components from './components';
import custom from './custom';
import discover from './discover';
import error from './error';
import file from './file';
import knowledgeBase from './knowledgeBase';
import metadata from './metadata';
import migration from './migration';
import modelProvider from './modelProvider';
import models from './models';
import plugin from './plugin';
import portal from './portal';
import providers from './providers';
import ragEval from './ragEval';
import setting from './setting';
import welcome from './welcome';

const resources = {
  auth,
  chat,
  clerk,
  common,
  components,
  custom,
  discover,
  error,
  file,
  knowledgeBase,
  metadata,
  migration,
  modelProvider,
  models,
  plugin,
  portal,
  providers,
  ragEval,
  setting,
  tool,
  welcome,
} as const;

if (!isCustomBranding) {
  // @ts-ignore
  delete resources.custom;
}

export default resources;
