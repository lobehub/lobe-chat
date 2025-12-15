import { CodeInterpreterApiName } from '../index';
import EditLocalFile from './EditLocalFile';
import MoveLocalFiles from './MoveLocalFiles';
import RunCommand from './RunCommand';
import WriteFile from './WriteFile';

/**
 * Cloud Code Interpreter Intervention Components Registry
 */
export const CodeInterpreterInterventions = {
  [CodeInterpreterApiName.editLocalFile]: EditLocalFile,
  [CodeInterpreterApiName.moveLocalFiles]: MoveLocalFiles,
  [CodeInterpreterApiName.runCommand]: RunCommand,
  [CodeInterpreterApiName.writeLocalFile]: WriteFile,
};
