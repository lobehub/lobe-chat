import { CodeInterpreterApiName } from '../index';
import EditLocalFile from './EditLocalFile';
import ListFiles from './ListFiles';
import MoveLocalFiles from './MoveLocalFiles';
import ReadLocalFile from './ReadLocalFile';
import RunCommand from './RunCommand';
import SearchFiles from './SearchFiles';
import WriteFile from './WriteFile';

/**
 * Cloud Code Interpreter Render Components Registry
 */
export const CodeInterpreterRenders = {
  [CodeInterpreterApiName.editLocalFile]: EditLocalFile,
  [CodeInterpreterApiName.listLocalFiles]: ListFiles,
  [CodeInterpreterApiName.moveLocalFiles]: MoveLocalFiles,
  [CodeInterpreterApiName.readLocalFile]: ReadLocalFile,
  [CodeInterpreterApiName.runCommand]: RunCommand,
  [CodeInterpreterApiName.searchLocalFiles]: SearchFiles,
  [CodeInterpreterApiName.writeLocalFile]: WriteFile,
};

// Export API names for use in other modules
export { CodeInterpreterApiName };
