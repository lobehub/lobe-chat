import { toRecord } from '@lobechat/utils/object';

/** Bounds the `cause` walk so a self-referencing error cannot loop forever. */
const MAX_CAUSE_DEPTH = 5;

/**
 * Whether an MCP call failed because the server rejected its credentials.
 *
 * The SDK transports (`StreamableHTTPError`, `SseError`) carry the HTTP status
 * only in `.code`; the message is the response body (e.g.
 * `{"error":"Unauthorized: Invalid or expired token"}`) and usually omits
 * "401". `MCPService` then wraps the transport error in a `TRPCError` whose
 * `cause` holds it, so walk the chain instead of matching message text.
 * `MCPClient.initialize` may also have already mapped it to an
 * `AUTHORIZATION_ERROR`.
 */
export const isMcpAuthorizationError = (error: unknown): boolean => {
  let current: unknown = error;
  for (let depth = 0; depth < MAX_CAUSE_DEPTH && current; depth++) {
    const record = toRecord(current);
    if (!record) return false;
    if (record.code === 401) return true;
    if (toRecord(record.data)?.type === 'AUTHORIZATION_ERROR') return true;
    current = record.cause;
  }
  return false;
};

/**
 * Model-visible content for an MCP credential rejection. The raw transport
 * error says nothing about who owns the connection, so models guessed and told
 * Agent Share visitors to "reauthorize in the browser" — but a shared run
 * executes with the creator's connection, which the visitor can neither see
 * nor repair (LOBE-14771).
 */
export const buildMcpAuthorizationErrorContent = (
  identifier: string,
  options: { isShareVisitor: boolean },
): string =>
  options.isShareVisitor
    ? `The '${identifier}' connection belongs to this agent's creator, and its authorization has expired or been revoked. The person in this shared conversation cannot reconnect it and has no sign-in or authorization option here. Tell them this tool is unavailable until the agent's creator reconnects it, do not ask them to sign in or authorize anything, and continue with what you can do without this tool.`
    : `The '${identifier}' connection's authorization has expired or been revoked (HTTP 401). Ask the user to reconnect '${identifier}' in their tool or connector settings, then retry.`;
