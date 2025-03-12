import STT from '../STT';
import Clear from './Clear';
import History from './History';
import Knowledge from './Knowledge';
import Model from './Model';
import Params from './Params';
import Search from './Search';
import { MainToken, PortalToken } from './Token';
import Tools from './Tools';
import Upload from './Upload';

export const actionMap = {
  clear: Clear,
  fileUpload: Upload,
  history: History,
  knowledgeBase: Knowledge,
  mainToken: MainToken,
  model: Model,
  params: Params,
  portalToken: PortalToken,
  search: Search,
  stt: STT,
  temperature: Params,
  tools: Tools,
} as const;

export type ActionKeys = keyof typeof actionMap;
