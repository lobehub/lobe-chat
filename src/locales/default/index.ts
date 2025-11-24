import auth from './auth';
import changelog from './changelog';
import chat from './chat';
import clerk from './clerk';
import color from './color';
import common from './common';
import components from './components';
import discover from './discover';
import editor from './editor';
import electron from './electron';
import error from './error';
import file from './file';
import hotkey from './hotkey';
import image from './image';
import knowledgeBase from './knowledgeBase';
import labs from './labs';
import metadata from './metadata';
import migration from './migration';
import modelProvider from './modelProvider';
import models from './models';
import oauth from './oauth';
import plugin from './plugin';
import portal from './portal';
import providers from './providers';
import ragEval from './ragEval';
import setting from './setting';
import subscription from './subscription';
import thread from './thread';
import tool from './tool';
import topic from './topic';
import welcome from './welcome';

const resources = {
  auth,
  changelog,
  chat,
  clerk,
  color,
  common,
  components,
  discover,
  editor,
  electron,
  error,
  file,
  hotkey,
  image,
  knowledgeBase,
  labs,
  metadata,
  migration,
  modelProvider,
  models,
  oauth,
  plugin,
  portal,
  providers,
  ragEval,
  setting,
  subscription,
  thread,
  tool,
  topic,
  welcome,
} as const;

export default resources;
