import type {
  GoalEdgeKind,
  GoalGraphDecision,
  GoalGraphSnapshot,
  GoalNodeKind,
  GoalTickResult,
} from '@lobechat/types';
import type { Command } from 'commander';
import pc from 'picocolors';

import { getTrpcClient } from '../api/client';
import { outputJson, printTable, truncate } from '../utils/format';
import { log } from '../utils/logger';
import { resolveAppUrlBuilder } from './task/url';

// Typed rather than inferred: an `as const` map is indexable by a widened
// `any` node kind, which is how a renamed kind silently printed `undefined`
// here after the type checker had signed off everywhere else.
const nodeIcon: Record<GoalNodeKind, string> = {
  decision: '◆',
  experiment: '⚗',
  finding: '●',
  problem: '◇',
  task: '▣',
};
/**
 * Every edge kind reads `source <kind> target`, so a row listing its INCOMING
 * edges by kind states the relationship backwards: an incoming `depends_on`
 * means the other node depends on THIS one, not the reverse. Render the inverse
 * verb instead, so each entry is a true sentence about the row it sits on.
 */
const inverseEdgeLabel: Record<GoalEdgeKind, string> = {
  answers: 'answered by',
  contains: 'inside',
  contradicts: 'contradicted by',
  decomposes: 'part of',
  depends_on: 'blocks',
  derived_from: 'ancestor of',
  investigates: 'investigated by',
  leads_to: 'follows',
  produces: 'produced by',
  supports: 'supported by',
};

const terminalOutcomes = new Set(['achieved', 'waiting_human', 'no_progress', 'failed']);

/** Backoff bounds for a transient `goal tick` failure. */
const TICK_RETRY_BASE_MS = 1000;
const TICK_RETRY_MAX_MS = 30_000;

/**
 * tRPC codes that are a verdict about the REQUEST, not about the trip to the
 * server: retrying them just reproduces the same answer. Everything else —
 * including a transport failure that never reached tRPC — is treated as a blip
 * worth surviving, because `goal run` is meant to be left unattended for hours
 * and a dropped socket must not end the run half-way.
 */
const fatalTickCodes = new Set([
  'BAD_REQUEST',
  'CONFLICT',
  'FORBIDDEN',
  'NOT_FOUND',
  'PARSE_ERROR',
  'UNAUTHORIZED',
]);

const trpcErrorCode = (error: unknown): string | undefined => {
  const value = error as { data?: { code?: string }; shape?: { data?: { code?: string } } };
  return value?.data?.code ?? value?.shape?.data?.code;
};

/**
 * A transport-level failure (`fetch failed`, ECONNRESET, a 502 from a proxy)
 * carries no tRPC envelope at all, so the ABSENCE of a code is the signal that
 * the request never got a verdict. Erring towards retry keeps an unrecognised
 * error shape from killing a multi-hour run.
 */
const isRetryableTickError = (error: unknown) => {
  const code = trpcErrorCode(error);
  return code === undefined || !fatalTickCodes.has(code);
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run one coordinator tick, riding out transient failures until `retryWindowMs`
 * of CONSECUTIVE failure has elapsed. The window is wall-clock rather than an
 * attempt count so a long outage is survivable without making the backoff
 * pointlessly aggressive; each delay is also clamped to what's left of the
 * window so the command never sleeps past its own budget (and so a tiny window
 * stays fast instead of blocking on the first 1s backoff).
 */
const tickWithRetry = async <T>(
  tick: () => Promise<T>,
  retryWindowMs: number,
  onRetry: (error: unknown, delayMs: number) => void,
): Promise<T> => {
  const deadline = Date.now() + retryWindowMs;
  for (let attempt = 0; ; attempt++) {
    try {
      return await tick();
    } catch (error) {
      const remaining = deadline - Date.now();
      if (!isRetryableTickError(error) || remaining <= 0) throw error;
      const delay = Math.min(TICK_RETRY_BASE_MS * 2 ** attempt, TICK_RETRY_MAX_MS, remaining);
      onRetry(error, delay);
      await sleep(delay);
    }
  }
};

interface GoalRunTickResult extends GoalTickResult {
  pollCount?: number;
  waitedMs?: number;
}

const isSameWaitingState = (previous: GoalRunTickResult | undefined, current: GoalTickResult) =>
  previous?.outcome === 'waiting_external' &&
  current.outcome === 'waiting_external' &&
  previous.message === current.message &&
  previous.nodeId === current.nodeId &&
  previous.taskId === current.taskId;

function printGraph(graph: GoalGraphSnapshot) {
  console.log(`\n${pc.bold(graph.goal.title)} ${pc.dim(graph.goal.id)} [${graph.goal.status}]`);
  if (graph.goal.requirement) console.log(`${pc.dim('Requirement:')} ${graph.goal.requirement}`);
  const incoming = new Map<string, typeof graph.edges>();
  for (const edge of graph.edges) {
    const list = incoming.get(edge.targetNodeId) ?? [];
    list.push(edge);
    incoming.set(edge.targetNodeId, list);
  }
  const rows = graph.nodes.map((node) => {
    const relations = (incoming.get(node.id) ?? [])
      .map((edge) => `${inverseEdgeLabel[edge.kind] ?? edge.kind} ${edge.sourceNodeId.slice(0, 8)}`)
      .join(', ');
    return [
      `${nodeIcon[node.kind]} ${node.kind}`,
      node.status,
      truncate(node.title, 46),
      node.taskId ?? '-',
      relations || '-',
      node.id,
    ];
  });
  console.log();
  printTable(rows, ['TYPE', 'STATUS', 'TITLE', 'TASK', 'RELATIONS', 'NODE ID']);
}

function printTick(result: GoalTickResult) {
  const icon =
    result.outcome === 'achieved'
      ? pc.green('✓')
      : result.outcome === 'waiting_human'
        ? pc.yellow('◆')
        : result.outcome === 'failed'
          ? pc.red('✗')
          : pc.blue('→');
  console.log(`${icon} ${pc.bold(result.outcome)} ${result.message}`);
  if (result.taskId) console.log(`  ${pc.dim(`task: ${result.taskId}`)}`);
  if (result.nodeId) console.log(`  ${pc.dim(`node: ${result.nodeId}`)}`);
}

export function registerGoalCommand(program: Command) {
  const goal = program.command('goal').description('Run long-horizon Goal Graphs');

  goal
    .command('create <title>')
    .description('Create a standalone goal and seed its graph')
    .option('-r, --requirement <text>', 'Acceptance requirement')
    .option(
      '-i, --instruction <text>',
      "The ask in the user's own words, shown on the problem node",
    )
    .option('-t, --task <title...>', 'Initial task node titles (omit to let the planner decompose)')
    .option('--agent <id>', 'Responsible agent ID')
    .option('--project <id>', 'Project ID')
                supervision: options.supervise
                  ? {
                      enabled: true,
                      maxIncidents: options.maxSupervisionIncidents
                        ? Number.parseInt(options.maxSupervisionIncidents, 10)
                        : undefined,
