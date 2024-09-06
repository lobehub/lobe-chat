import { LobeSessions } from './agentSession';

export enum SessionDefaultGroup {
  Default = 'default',
  Pinned = 'pinned',
}

export type SessionGroupId = SessionDefaultGroup | string;

export interface SessionGroupItem {
  createdAt: number;
  id: string;
  name: string;
  sort?: number;
  updatedAt: number;
}

export type SessionGroups = SessionGroupItem[];

export interface CustomSessionGroup extends SessionGroupItem {
  children: LobeSessions;
}

export type LobeSessionGroups = SessionGroupItem[];
