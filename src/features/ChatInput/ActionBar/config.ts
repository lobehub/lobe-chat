import STT from '../STT';
import Clear from './Clear';
import History from './History';
import Knowledge from './Knowledge';
import ModelSwitch from './ModelSwitch';
import Params from './Params';
import { MainToken, PortalToken } from './Token';
import Tools from './Tools';
import Upload from './Upload';

export const actionMap = {
  clear: Clear,
  fileUpload: Upload,
  history: History,
  knowledgeBase: Knowledge,
  mainToken: MainToken,
  model: ModelSwitch,
  params: Params,
  portalToken: PortalToken,
  stt: STT,
  temperature: Params,
  tools: Tools,
} as const;

export type ActionKeys = keyof typeof actionMap;
