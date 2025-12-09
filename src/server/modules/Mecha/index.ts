/**
 * Mecha Server Module
 *
 * This module provides server-side implementations for AI agent execution,
 * mirroring the frontend Mecha functionality but with database-driven data sources.
 *
 * Components:
 * - AgentToolsEngine: Server-side tools generation engine
 * - ContextEngineering: (TODO) Server-side context engineering
 */

// Agent Tools Engine
export type {
  InstalledPlugin,
  ServerAgentToolsContext,
  ServerAgentToolsEngineConfig,
  ServerCreateAgentToolsEngineParams,
} from './AgentToolsEngine';
export { createServerAgentToolsEngine, createServerToolsEngine } from './AgentToolsEngine';
