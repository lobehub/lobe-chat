import { LobeSessions } from './agentSession';

export enum SessionDefaultGroup {
  Default = 'default',
  Pinned = 'pinned',
}

export type SessionGroupId = SessionDefaultGroup | string;

export interface SessionGroupItem {
  createdAt: Date;
  id: string;
  name: string;
  sort?: number | null;
  updatedAt: Date;
}

export type SessionGroups = SessionGroupItem[];

export interface CustomSessionGroup extends SessionGroupItem {
  children: LobeSessions;
}

export type LobeSessionGroups = SessionGroupItem[];
