import AgentRoutes from './agents.route';
import ChatRoutes from './chat.route';
import FileRoutes from './files.route';
import MessageTranslatesRoutes from './message-translates.route';
import MessageRoutes from './message.route';
import RolesRoutes from './roles.route';
import SessionRoutes from './sessions.route';
import TopicsRoutes from './topics.route';
import UserRoutes from './users.route';

export default {
  agents: AgentRoutes,
  chat: ChatRoutes,
  files: FileRoutes,
  message_translates: MessageTranslatesRoutes,
  messages: MessageRoutes,
  roles: RolesRoutes,
  sessions: SessionRoutes,
  topics: TopicsRoutes,
  user: UserRoutes,
};
