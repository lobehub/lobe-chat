#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const TERMINAL_STATUSES = new Set([
  'done',
  'error',
  'interrupted',
  'cancelled',
  'canceled',
  'aborted',
]);
const DEFAULTS = {
  idleMs: 20 * 60 * 1000,
  interruptGraceMs: 30 * 1000,
  pollMs: 60 * 1000,
  snapshotMs: 5 * 60 * 1000,
};

class RunnerError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.name = 'RunnerError';
    this.exitCode = exitCode;
  }
}

function envDuration(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function parseArgs(argv) {
  const options = {
    cli: undefined,
    agentId: undefined,
    agentSlug: undefined,
    runMode: 'agent',
    evalRunId: undefined,
    evalCaseId: undefined,
    prompt: undefined,
    deviceReady: '/tmp/lh-device-ready',
    logDir: '/logs/agent',
    statusPath: `${process.env.HOME || ''}/.lobehub/daemon.status.json`,
    supervisorConfig: '/tmp/lh-supervisord.conf',
    idleMs: envDuration('LH_RUNNER_IDLE_MS', DEFAULTS.idleMs),
    interruptGraceMs: envDuration('LH_RUNNER_INTERRUPT_GRACE_MS', DEFAULTS.interruptGraceMs),
    pollMs: envDuration('LH_RUNNER_POLL_MS', DEFAULTS.pollMs),
    snapshotMs: envDuration('LH_RUNNER_SNAPSHOT_MS', DEFAULTS.snapshotMs),
  };

  const values = new Set([
    '--agent-id',
    '--agent-slug',
    '--cli',
    '--device-ready',
    '--log-dir',
    '--prompt',
    '--run-mode',
    '--eval-run-id',
    '--eval-case-id',
    '--status-path',
    '--supervisor-config',
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (!values.has(flag)) throw new RunnerError(`Unknown runner option: ${flag}`);
    const value = argv[++index];
    if (!value || value.startsWith('--')) throw new RunnerError(`Missing value for ${flag}`);
    switch (flag) {
      case '--agent-id': {
        options.agentId = value;
        break;
      }
      case '--agent-slug': {
        options.agentSlug = value;
        break;
      }
      case '--cli': {
        options.cli = value;
        break;
      }
      case '--device-ready': {
        options.deviceReady = value;
        break;
      }
      case '--log-dir': {
        options.logDir = value;
        break;
      }
      case '--prompt': {
        options.prompt = value;
        break;
      }
      case '--run-mode': {
        options.runMode = value;
        break;
      }
      case '--eval-run-id': {
        options.evalRunId = value;
        break;
      }
      case '--eval-case-id': {
        options.evalCaseId = value;
        break;
      }
      case '--status-path': {
        options.statusPath = value;
        break;
      }
      case '--supervisor-config': {
        options.supervisorConfig = value;
        break;
      }
    }
  }

  if (!options.cli) throw new RunnerError('Missing required option: --cli');
  if (options.runMode === 'eval') {
    if (!options.evalRunId || !options.evalCaseId) {
      throw new RunnerError('eval mode requires --eval-run-id and --eval-case-id');
    }
  } else if (!options.prompt || (!options.agentId && !options.agentSlug)) {
    throw new RunnerError('agent/task mode requires --prompt and --agent-id or --agent-slug');
  }
  if (!['agent', 'task', 'eval'].includes(options.runMode)) {
    throw new RunnerError('--run-mode must be agent, task or eval');
  }
  return options;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function parseOperationStatus(response) {
  if (response === null) return { kind: 'missing' };
  const currentState = response && typeof response === 'object' ? response.currentState : undefined;
  if (!currentState || typeof currentState !== 'object') {
    return { kind: 'unavailable', error: 'status response has no currentState' };
  }
  return { kind: 'state', currentState, status: currentState.status || 'unknown' };
}

function snapshotRecord(response, operationId, topicId) {
  const currentState = response?.currentState;
  if (!currentState || typeof currentState !== 'object') return null;
  return {
    capturedAt: new Date().toISOString(),
    operationId,
    topicId,
    currentState: {
      cost: currentState.cost,
      lastModified: currentState.lastModified,
      status: currentState.status,
      stepCount: currentState.stepCount,
      usage: currentState.usage,
    },
  };
}

function isIdle(status, startedAt, now, idleMs) {
  if (now - startedAt < idleMs) return false;
  const lastRequestAt = Date.parse(status?.lastRequestAt || '');
  return !Number.isFinite(lastRequestAt) || now - lastRequestAt >= idleMs;
}

function appendLine(filePath, line) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${line}\n`);
}

class AgentRunner {
  constructor(options) {
    this.options = options;
    this.agentLog = path.join(options.logDir, 'agent-run.log');
    this.statusLog = path.join(options.logDir, 'operation-status.jsonl');
    this.taskUsageLog = path.join(options.logDir, 'task-usage.jsonl');
    this.statusErrorsLog = path.join(options.logDir, 'operation-status-errors.log');
    this.cleanupLog = path.join(options.logDir, 'device-cleanup.log');
    this.operationId = undefined;
    this.topicId = undefined;
    this.taskId = undefined;
    this.deviceId = undefined;
    this.latestStatus = undefined;
    this.operationTerminal = false;
    this.interruptAttempted = false;
    this.interruptConfirmed = false;
    this.cleanupFailure = false;
    this.activeChild = undefined;
    this.signalCode = undefined;
    this.resolveSignal = undefined;
    this.signalPromise = new Promise((resolve) => {
      this.resolveSignal = resolve;
    });
    this.signalHandlers = {
      SIGINT: () => this.requestSignal(130),
      SIGTERM: () => this.requestSignal(143),
    };
  }

  requestSignal(code) {
    if (this.signalCode) return;
    this.signalCode = code;
    if (this.activeChild) this.activeChild.kill('SIGTERM');
    this.resolveSignal(code);
  }

  installSignalHandlers() {
    for (const [signal, handler] of Object.entries(this.signalHandlers))
      process.on(signal, handler);
  }

  removeSignalHandlers() {
    for (const [signal, handler] of Object.entries(this.signalHandlers))
      process.off(signal, handler);
  }

  checkSignal() {
    if (this.signalCode)
      throw new RunnerError(`Received signal (exit ${this.signalCode})`, this.signalCode);
  }

  log(message, error = false) {
    appendLine(this.agentLog, message);
    (error ? console.error : console.log)(message);
  }

  async wait(ms) {
    await Promise.race([
      new Promise((resolve) => setTimeout(resolve, ms)),
      this.signalPromise.then((code) => {
        throw new RunnerError(`Received signal (exit ${code})`, code);
      }),
    ]);
    this.checkSignal();
  }

  exec(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
      this.activeChild = child;
      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk;
      });
      child.once('error', (error) => {
        this.activeChild = undefined;
        reject(error);
      });
      child.once('close', (code, signal) => {
        this.activeChild = undefined;
        resolve({ code: code ?? 1, signal, stdout, stderr });
      });
    });
  }

  async runCli(args) {
    this.checkSignal();
    const result = await this.exec(this.options.cli, args);
    this.checkSignal();
    if (result.code !== 0) {
      throw new RunnerError(
        `CLI failed (${result.code}): ${result.stderr.trim() || result.stdout.trim() || args.join(' ')}`,
      );
    }
    try {
      return JSON.parse(result.stdout);
    } catch {
      throw new RunnerError(`CLI returned invalid JSON: ${args.join(' ')}`);
    }
  }

  async startRun() {
    if (this.options.runMode === 'eval') {
      const response = await this.runCli([
        'eval',
        'agent',
        'run',
        '--run-id',
        this.options.evalRunId,
        '--case-id',
        this.options.evalCaseId,
        '--device',
        'local',
        '--json',
      ]);
      if (!response.ok || response.data?.success !== true) {
        throw new RunnerError(
          response.error?.message || response.data?.error || 'Eval failed to start',
        );
      }
      return response.data;
    }
    if (this.options.runMode === 'agent') {
      return this.runCli([
        'agent',
        'run',
        '--agent-id',
        this.options.agentId,
        '--prompt',
        this.options.prompt,
        '--device',
        'local',
        '--detach',
        '--json',
      ]);
    }

    const task = await this.runCli([
      'task',
      'create',
      '--instruction',
      this.options.prompt,
      '--agent',
      this.options.agentId,
      '--json',
    ]);
    if (typeof task?.id !== 'string') throw new RunnerError('lh task create returned no task ID');
    this.taskId = task.id;
    fs.mkdirSync(path.dirname(this.taskUsageLog), { recursive: true });
    fs.closeSync(fs.openSync(this.taskUsageLog, 'a'));
    this.log(`Task: ${task.identifier || task.id}`);
    return this.runCli(['task', 'run', task.id, '--device', 'local', '--json']);
  }

  async resolveAgentId() {
    if (this.options.runMode === 'eval') return;
    if (this.options.agentId) return;
    const agent = await this.runCli([
      'agent',
      'view',
      '--slug',
      this.options.agentSlug,
      '--json',
      'id',
    ]);
    if (typeof agent?.id !== 'string') {
      throw new RunnerError(`lh agent view returned no ID for slug: ${this.options.agentSlug}`);
    }
    this.options.agentId = agent.id;
    this.log(`Agent: ${agent.id} (${this.options.agentSlug})`);
  }

  async run() {
    this.installSignalHandlers();
    try {
      if (!fs.existsSync(this.options.deviceReady)) {
        throw new RunnerError(`lh local device is not ready: ${this.options.deviceReady}`);
      }
      const deviceStatus = readJson(this.options.statusPath);
      this.deviceId =
        deviceStatus?.connectionStatus === 'connected' ? deviceStatus.deviceId : undefined;
      await this.resolveAgentId();
      const started = await this.startRun();
      if (typeof started?.operationId !== 'string' || typeof started?.topicId !== 'string') {
        throw new RunnerError(`lh ${this.options.runMode} run returned no operation/topic IDs`);
      }
      this.operationId = started.operationId;
      this.topicId = started.topicId;
      await fs.promises.mkdir(this.options.logDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(this.options.logDir, 'run-start.json'),
        JSON.stringify(started),
      );
      this.log(`Operation: ${this.operationId} Topic: ${this.topicId}`);

      const startedAt = Date.now();
      let nextSnapshotAt = 0;
      while (true) {
        this.checkSignal();
        const polled = await this.pollStatus();
        const now = Date.now();
        if (polled.kind === 'missing') {
          throw new RunnerError('Operation status disappeared before reaching a terminal state');
        }
        if (polled.kind === 'state') {
          this.latestStatus = { currentState: polled.currentState };
          if (now >= nextSnapshotAt) {
            await this.captureSnapshot();
            nextSnapshotAt = now + this.options.snapshotMs;
          }
          if (TERMINAL_STATUSES.has(polled.status)) {
            this.operationTerminal = true;
            await this.captureSnapshot();
            if (polled.status === 'done') {
              if (this.options.runMode === 'eval') await this.waitForEvalCompletion();
              this.log('Agent finished');
            }
            if (polled.status !== 'done') {
              throw new RunnerError(
                `Agent ended with status: ${polled.status}`,
                polled.status === 'interrupted' ? 130 : 1,
              );
            }
            return;
          }
        }

        if (isIdle(readJson(this.options.statusPath), startedAt, now, this.options.idleMs)) {
          const confirmed = await this.interruptAndWait();
          if (confirmed) {
            throw new RunnerError(
              `No device request for ${this.options.idleMs / 60_000} minutes; agent interrupted`,
              124,
            );
          }
          throw new RunnerError(
            `No device request for ${this.options.idleMs / 60_000} minutes; interrupt was not acknowledged`,
            124,
          );
        }
        await this.wait(this.options.pollMs);
      }
    } finally {
      await this.cleanup();
      this.removeSignalHandlers();
    }
  }

  async pollStatus() {
    try {
      const response = await this.runCli([
        'agent',
        'status',
        this.operationId,
        '--json=currentState',
      ]);
      const result = parseOperationStatus(response);
      if (result.kind === 'unavailable') appendLine(this.statusErrorsLog, result.error);
      return result;
    } catch (error) {
      if (error instanceof RunnerError && this.signalCode) throw error;
      appendLine(this.statusErrorsLog, error.message);
      return { kind: 'unavailable', error: error.message };
    }
  }

  async waitForEvalCompletion() {
    // Operation completion can precede the eval hook. Do not start the verifier
    // until the server has handed this topic to the external scorer.
    const deadline = Date.now() + Math.max(this.options.interruptGraceMs, this.options.pollMs * 2);
    while (true) {
      const response = await this.runCli([
        'eval',
        'run-topic',
        'list',
        '--run-id',
        this.options.evalRunId,
        '--json',
      ]);
      if (!response.ok) throw new RunnerError(response.error?.message || 'Eval topic query failed');
      const topic = response.data.find((item) => item.topicId === this.topicId);
      if (topic?.status === 'external') return;
      if (['error', 'timeout', 'aborted', 'passed', 'failed'].includes(topic?.status)) {
        throw new RunnerError(`Expected external scoring; eval topic ended as ${topic.status}`);
      }
      if (Date.now() >= deadline)
        throw new RunnerError('Eval completion hook did not finish in time');
      await this.wait(Math.min(this.options.pollMs, deadline - Date.now()));
    }
  }

  writeSnapshot() {
    const record = snapshotRecord(this.latestStatus, this.operationId, this.topicId);
    if (record) appendLine(this.statusLog, JSON.stringify(record));
  }

  async captureSnapshot() {
    this.writeSnapshot();
    if (this.options.runMode !== 'task' || !this.taskId) return;

    try {
      const usage = await this.runCli(['task', 'usage', this.taskId, '--json']);
      appendLine(
        this.taskUsageLog,
        JSON.stringify({ capturedAt: new Date().toISOString(), ...usage }),
      );
    } catch (error) {
      appendLine(this.statusErrorsLog, `task usage: ${error.message}`);
    }
  }

  async interruptAndWait() {
    if (this.interruptAttempted) return this.interruptConfirmed;
    this.interruptAttempted = true;
    try {
      const result = await this.runCli([
        'agent',
        'interrupt',
        '--operation-id',
        this.operationId,
        '--json',
      ]);
      if (result?.success !== true) {
        const polled = await this.pollStatus();
        if (polled.kind === 'state' && TERMINAL_STATUSES.has(polled.status)) {
          this.latestStatus = { currentState: polled.currentState };
          this.operationTerminal = true;
          this.interruptConfirmed = true;
          await this.captureSnapshot();
          return true;
        }
        this.log('Agent interrupt was not acknowledged', true);
        return false;
      }

      const deadline = Date.now() + this.options.interruptGraceMs;
      while (Date.now() < deadline) {
        const polled = await this.pollStatus();
        if (polled.kind === 'state' && TERMINAL_STATUSES.has(polled.status)) {
          this.latestStatus = { currentState: polled.currentState };
          this.operationTerminal = true;
          this.interruptConfirmed = true;
          await this.captureSnapshot();
          return true;
        }
        await this.wait(Math.min(this.options.pollMs, deadline - Date.now()));
      }
    } catch (error) {
      this.log(`Agent interrupt failed: ${error.message}`, true);
    }
    return false;
  }

  async cleanup() {
    await this.captureSnapshot();
    if (this.operationId && !this.operationTerminal && !this.interruptAttempted) {
      await this.interruptAndWait();
    }

    if (this.topicId) {
      try {
        const result = await this.exec(this.options.cli, [
          'topic',
          'export',
          this.topicId,
          '--format',
          'atif',
          '--output',
          path.join(this.options.logDir, 'trajectory.json'),
        ]);
        if (result.code !== 0) {
          throw new RunnerError(
            result.stderr.trim() || result.stdout.trim() || 'topic export failed',
          );
        }
      } catch (error) {
        this.log(`Trajectory export failed: ${error.message}`, true);
      }
    }

    try {
      const result = await this.exec('supervisorctl', [
        '-c',
        this.options.supervisorConfig,
        'shutdown',
      ]);
      if (result.code !== 0 && result.stderr.trim())
        appendLine(this.cleanupLog, result.stderr.trim());
    } catch (error) {
      appendLine(this.cleanupLog, `supervisor shutdown failed: ${error.message}`);
    }

    if (!this.deviceId) return;
    if (!this.operationTerminal && !this.interruptConfirmed) {
      this.log(`Keeping device ${this.deviceId}: operation termination was not acknowledged`, true);
      return;
    }
    try {
      const result = await this.exec(this.options.cli, [
        'device',
        'delete',
        '--yes',
        this.deviceId,
      ]);
      if (result.code !== 0) {
        this.cleanupFailure = true;
        appendLine(
          this.cleanupLog,
          result.stderr.trim() || result.stdout.trim() || 'device delete failed',
        );
      }
    } catch (error) {
      this.cleanupFailure = true;
      appendLine(this.cleanupLog, `device delete failed: ${error.message}`);
    }
  }
}

async function main() {
  const runner = new AgentRunner(parseArgs(process.argv.slice(2)));
  try {
    await runner.run();
    if (runner.cleanupFailure) process.exitCode = 1;
  } catch (error) {
    runner.log(error.message, true);
    process.exitCode = error.exitCode || 1;
  }
}

if (require.main === module)
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

module.exports = { isIdle, parseArgs, parseOperationStatus, snapshotRecord };
