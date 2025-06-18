import AgentRoutes from './agents.route';
import ChatRoutes from './chat.route';
import MessageTranslatesRoutes from './message-translates.route';
import TopicRoutes from './message.route';
import RolesRoutes from './roles.route';
import TopicsRoutes from './topics.route';
import UserRoutes from './users.route';

export default {
  agents: AgentRoutes,
  chat: ChatRoutes,
  message_translates: MessageTranslatesRoutes,
  roles: RolesRoutes,
  topic: TopicRoutes,
  topics: TopicsRoutes,
  user: UserRoutes,
};
