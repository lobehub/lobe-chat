import AgentRoutes from './agents.route';
import TopicRoutes from './message.route';
import RolesRoutes from './roles.route';
import UserRoutes from './users.route';

export default {
  agents: AgentRoutes,
  roles: RolesRoutes,
  topic: TopicRoutes,
  user: UserRoutes,
};
