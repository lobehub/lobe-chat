import { CodeInterpreterApiName } from '../index';
import { ExecuteCodeInspector } from './ExecuteCode';

/**
 * Code Interpreter Inspector Components Registry
 */
export const CodeInterpreterInspectors = {
  [CodeInterpreterApiName.executeCode]: ExecuteCodeInspector,
};
