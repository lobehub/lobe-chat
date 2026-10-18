import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';

/** Slugs owned by builtin provisioning; a group delete must never reach one. */
export const RESERVED_BUILTIN_AGENT_SLUGS: string[] = Object.values(BUILTIN_AGENT_SLUGS);
