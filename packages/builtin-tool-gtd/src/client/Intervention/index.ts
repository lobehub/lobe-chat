import { BuiltinIntervention } from '@lobechat/types';

import { GTDApiName } from '../../types';
import AddTodoIntervention from './AddTodo';
import ClearTodosIntervention from './ClearTodos';

/**
 * GTD Tool Intervention Components Registry
 *
 * Intervention components allow users to review and modify tool parameters
 * before the tool is executed.
 */
export const GTDInterventions: Record<string, BuiltinIntervention> = {
  [GTDApiName.addTodo]: AddTodoIntervention as BuiltinIntervention,
  [GTDApiName.clearTodos]: ClearTodosIntervention as BuiltinIntervention,
};

export { default as AddTodoIntervention } from './AddTodo';
export { default as ClearTodosIntervention } from './ClearTodos';
