import { GTDApiName } from '../../types';
import TodoListRender from './TodoList';

/**
 * GTD Tool Render Components Registry
 *
 * All todo operations use the same TodoList render component
 * which displays the current state of the todo list.
 */
export const GTDRenders = {
  // All todo operations render the same TodoList UI
  [GTDApiName.addTodo]: TodoListRender,
  [GTDApiName.clearTodos]: TodoListRender,
  [GTDApiName.completeTodo]: TodoListRender,
  [GTDApiName.listTodos]: TodoListRender,
};

export type { TodoListCallbacks, TodoListRenderState } from './TodoList';
export { default as TodoListRender, TodoListUI } from './TodoList';
