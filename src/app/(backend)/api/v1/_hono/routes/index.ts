import AgentRoutes from './agents.route';
import ChatRoutes from './chat.route';
import FileRoutes from './files.route';
import MessageTranslatesRoutes from './message-translates.route';
import MessageRoutes from './message.route';
import RolesRoutes from './roles.route';
import SessionGroupRoutes from './session-groups.route';
import SessionRoutes from './sessions.route';
import TopicsRoutes from './topics.route';
import UserRoutes from './users.route';

export default {
  'agents': AgentRoutes,
  'chat': ChatRoutes,
  'files': FileRoutes,
  'message-translates': MessageTranslatesRoutes,
  'messages': MessageRoutes,
  'roles': RolesRoutes,
  'session-groups': SessionGroupRoutes,
  'sessions': SessionRoutes,
  'topics': TopicsRoutes,
  'users': UserRoutes,
};
