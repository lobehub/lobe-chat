/**
 * 移动端知识库类型定义
 * 复制自 web 端，保持完全一致
 */

export interface KnowledgeBaseItem {
  avatar: string | null;
  createdAt: Date;
  description?: string | null;
  enabled?: boolean;
  id: string;
  isPublic: boolean | null;
  name: string;
  settings: any;
  type: string | null;
  updatedAt: Date;
}

export enum KnowledgeType {
  File = 'file',
  KnowledgeBase = 'knowledgeBase',
}

export interface KnowledgeItem {
  avatar?: string | null;
  description?: string | null;
  enabled?: boolean;
  fileType?: string;
  id: string;
  name: string;
  type: KnowledgeType;
}
