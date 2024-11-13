import STT from '../STT';
import Clear from './Clear';
import History from './History';
import Knowledge from './Knowledge';
import ModelSwitch from './ModelSwitch';
import Temperature from './Temperature';
import Token from './Token';
import Tools from './Tools';
import Upload from './Upload';

export const actionMap = {
  clear: Clear,
  fileUpload: Upload,
  history: History,
  knowledgeBase: Knowledge,
  model: ModelSwitch,
  stt: STT,
  temperature: Temperature,
  token: Token,
  tools: Tools,
} as const;

export type ActionKeys = keyof typeof actionMap;
