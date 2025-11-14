import { LocalSystemApiName } from '../index';
import MoveLocalFiles from './MoveLocalFiles';
import RunCommand from './RunCommand';

/**
 * Local System Intervention Components Registry
 */
export const LocalSystemInterventions = {
  [LocalSystemApiName.moveLocalFiles]: MoveLocalFiles,
  [LocalSystemApiName.runCommand]: RunCommand,
};
