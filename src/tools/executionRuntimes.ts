import { KnowledgeBaseManifest } from './knowledge-base';
import { KnowledgeBaseExecutionRuntime } from './knowledge-base/ExecutionRuntime';
import { LocalSystemManifest } from './local-system';
import { LocalSystemExecutionRuntime } from './local-system/ExecutionRuntime';
import { WebBrowsingManifest } from './web-browsing';
import { WebBrowsingExecutionRuntime } from './web-browsing/ExecutionRuntime';

export const BuiltinToolServerRuntimes: Record<string, any> = {
  [KnowledgeBaseManifest.identifier]: KnowledgeBaseExecutionRuntime,
  [LocalSystemManifest.identifier]: LocalSystemExecutionRuntime,
  [WebBrowsingManifest.identifier]: WebBrowsingExecutionRuntime,
};
