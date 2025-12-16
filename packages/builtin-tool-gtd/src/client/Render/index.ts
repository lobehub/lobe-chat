import { GTDApiName } from '../../types';
import AddTodo from './AddTodo';
import ClearTodos from './ClearTodos';
import CompleteTodo from './CompleteTodo';
import ListTodos from './ListTodos';

/**
 * GTD Tool Render Components Registry
 *
 * MVP version includes Todo renders only.
 * Plan renders will be added when Plan functionality is fully implemented.
 */
export const GTDRenders = {
  // Todo operations
  [GTDApiName.addTodo]: AddTodo,
  [GTDApiName.clearTodos]: ClearTodos,
  [GTDApiName.completeTodo]: CompleteTodo,
  [GTDApiName.listTodos]: ListTodos,
};
