import { FC } from 'react';

import Clear from './Clear';
import History from './History';
import ModelSwitch from './ModelSwitch';
import Temperature from './Temperature';
import Token from './Token';

export const actionMap: Record<string, FC> = {
  clear: Clear,
  history: History,
  model: ModelSwitch,
  temperature: Temperature,
  token: Token,
};

// we can make these action lists configurable in the future
export const leftActionList = ['model', 'temperature', 'history', 'token'];
export const rightActionList = ['clear'];
