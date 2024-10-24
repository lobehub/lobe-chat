export interface IExportService {
  exportAgents(): Promise<void>;
  exportAll(): Promise<void>;
  exportSessions(): Promise<void>;
  exportSettings(): Promise<void>;
  exportSingleAgent(id: string): Promise<void>;
  exportSingleSession(id: string): Promise<void>;
  exportSingleTopic(sessionId: string, topicId: string): Promise<void>;
}
