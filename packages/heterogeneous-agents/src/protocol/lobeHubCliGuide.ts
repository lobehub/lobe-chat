/**
 * What an external CLI agent (Claude Code, Codex, Kimi…) is told about `lh`,
 * the LobeHub CLI, at the start of a session.
 *
 * Those agents reach LobeHub the same way a human operator does — by running
 * `lh` in their own shell — but nothing in their native context mentions that
 * the binary exists, is already authenticated, or that the conversation they
 * are answering inside is addressable. So they fall back to what they can see:
 * the working directory. This block closes that gap once per session.
 *
 * Deliberately a capability map, not a manual. Exact flags come from
 * `lh man <command>`, which renders the installed CLI's own command tree and
 * therefore cannot drift from the version actually on this machine; a
 * hand-copied flag list here would. The homogeneous runtime gets the same
 * material as a loadable skill (`@lobechat/builtin-skills`'s `lobehub` skill)
 * — hetero agents have no skill loader, hence the inlined summary.
 *
 * Two things it deliberately does NOT promise, because they are not true on
 * every transport:
 *
 * - **Credentials.** The cloud sandbox is handed a user-scoped JWT, and a
 *   desktop client-mode run inherits the machine's own `lh login`. The
 *   device-dispatch paths (desktop gateway, `lh connect`) put the run's
 *   operation token in `LOBEHUB_JWT` (or `LOBEHUB_JWT_FILE` for Codex). A token
 *   minted with `caller:act` acts as the user who started the run, but only in
 *   the run's workspace and only while the run lasts; older tokens still reach
 *   just ingest/finish. Either way the agent must not swap it for the device's
 *   saved login, which on a shared device belongs to someone else — so the
 *   guide offers no fallback, and the CLI refuses a mismatched one anyway
 *   (`checkRunIdentity`, `LOBEHUB_RUN_USER_ID`).
 * - **`LOBEHUB_AGENT_ID`.** Desktop client mode sets it through
 *   `buildLobeHubSessionEnv`. CLI/Desktop dispatch launchers, including
 *   OpenClaw/Hermes, clear inherited identity and inject the current dispatch's
 *   agent id when supplied; a missing id must not retain the launcher's identity.
 *   Gateway-dispatched `lh hetero exec` runs preserve that id through
 *   `spawnAgent` to the external agent. The run token does not change
 *   authorship. The id is still not guaranteed on every path:
 *   `lh task comment` refuses topic/operation contexts with a missing or blank
 *   agent id rather than attributing Agent output to the user.
 */
export const lobeHubCliGuide = [
  '## LobeHub CLI (`lh`)',
  '',
  "You are running inside a LobeHub conversation, on a machine where the `lh` CLI is already installed and the run normally carries the user's credentials in its environment — never install it, and never run `lh login`.",
  '',
  '- **You already know where you are.** `LOBEHUB_TOPIC_ID` (this conversation) and `LOBEHUB_OPERATION_ID` (this run) are in your environment, and `LOBEHUB_AGENT_ID` (you) and `LOBEHUB_WORKSPACE_ID` (the workspace this conversation belongs to, which scopes every `lh` call) are too whenever the run carries them. They are ordinary environment variables, so every sub-shell, script or tool you spawn inherits them. Pass them straight to commands rather than listing agents or topics to find yourself; if the one you need is empty, say so instead of guessing an id.',
  '- **If `lh` is older than this app**, the shell may have found a stale global install first: `lh man` lacks a command you expect, or `lh` reports an unknown command. When `LOBEHUB_CLI` is set it is the path of the CLI this app ships — run that path instead of `lh` for the rest of the session.',
  '- **Look commands up, do not guess them.** `lh man <command>` (e.g. `lh man doc create`) prints the manual for the CLI actually installed here, including exactly which flags that command takes. Many commands offer `--json` for structured output, but not all of them — the manual is what says so, and an invented flag just fails the call.',
  '- **What it reaches:** `lh kb` knowledge bases · `lh doc` documents · `lh file` files · `lh artifact` artifacts · `lh topic` / `lh message` past conversations · `lh agent` agents · `lh task` / `lh project` work · `lh widget` / `lh dashboard` monitoring widgets and dashboards · `lh search` local resources and the web · `lh gen` text/image/video/TTS/ASR generation · `lh memory` user memory · `lh notify` notifications to the user · `lh model` / `lh provider` / `lh plugin` / `lh skill` platform configuration · `lh bot` chat-platform bots.',
  "- **Widgets run code with the user's credentials.** Before `lh widget dry-run` of a draft that declares connector credentials (`manifest.env`) or network hosts (`manifest.network.allow`), show the user that version id, what the script does and which credentials and hosts it uses, and wait for their explicit approval of that exact version before passing `--version <id> --yes`. Never publish (`lh widget publish`) without the user's confirmation.",
  '- **When to use it:** whenever the user asks for something that lives in LobeHub rather than in this working directory — saving a document, recalling an earlier conversation, generating an image, or changing your own agent configuration. Say what you did and where it landed.',
  "- **Your `lh` commands act as the user who started this conversation.** On a connected device they are limited to this conversation's workspace and to this run. If one comes back with an authentication or permission error, do not clear or replace `LOBEHUB_JWT` / `LOBEHUB_JWT_FILE` and do not switch to another login — tell the user what you were trying to do and what the error said.",
  '- **Leave these alone:** `lh hetero` and `lh connect` run the infrastructure that is executing you. And never change the persistent workspace scope with `lh workspace use` — it silently rewrites the target of every later command in this session.',
].join('\n');
