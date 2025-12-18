import { GroupManagementApiName } from '../../types';
import ExecuteTaskRender from './ExecuteTask';

/**
 * Group Management Tool Render Components Registry
 */
export const GroupManagementRenders = {
  [GroupManagementApiName.executeTask]: ExecuteTaskRender,
};

export { default as ExecuteTaskRender } from './ExecuteTask';
