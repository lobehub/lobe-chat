# Acceptance delegation

Default to **one primary agent and one execution worker**. The worker checks the
environment, drafts the plan, executes it, and prepares evidence. The primary
challenges the plan before execution and reviews the complete evidence at the
end. Do not require primary approval after every case or create a separate final
audit worker. Reuse the execution worker across stages and repairs.

## Select the worker without assuming cheap defaults

Read the current host's tool schema or instructions and explicitly select the
least expensive available model capable of the task. Pass the supported value,
which may be an enum alias rather than a full model ID; do not invent `cheap` as
a model name. Claude Code and Codex use their own native controls. Do not copy
one host's API into another or guess CLI flags. Per-dispatch selection avoids
the need to inspect user defaults.

An explicitly configured worker default is usable when its effective selection
is known and suitable. Missing settings, `inherit`, or unknown models do not
establish a lower-cost worker. Do not read secrets or change user settings to
resolve this. If lower-cost selection is unavailable, retain at most the single
execution worker when independent execution is needed; otherwise the primary
may execute directly and disclose builder self-verification. Honor explicit user
requirements for independent execution. Never add a reviewer as a fallback.

Record the selected model and selection mechanism, plus the reported model when
available. Leave unknown values unknown. Lower per-token cost does not prove
lower total cost; claim savings only with comparable usage evidence. Escalate
only for a concrete capability gap within host/user limits. Send bounded briefs
and artifact paths instead of the full parent history; do not delegate individual
clicks or commands or spawn recursively from the worker.

## 1. Check the environment

Give the worker the original requirement, changed behavior, target revision,
authorized surface, this skill, relevant project-adapter paths, and both the generic
and project living-log paths. The worker loads the common-mistakes checklists and
probe-pattern indexes before planning, and rereads both checklists before marking
any case `pass`, following the skill's living-log retrieval rules. It inventories existing
instances and checks dependencies, authentication, and available probes before
drafting executable cases. It may prepare the environment within existing
authority; environment mechanics do not create new permissions.

Maintain a run ledger with process/session identities, owner, stop commands,
fixtures and restoration steps. The worker owns cleanup; keep the review
environment available until the primary releases it after final review, following
the project's teardown order. The primary collects its terminal result before
final handoff. If the host cannot resume the worker, hand its replacement
the ledger and artifacts. Verify ownership and liveness before replacing it so
an existing task is not accidentally started twice.

## 2. Settle the plan before execution

The primary supplies requirements and implementation facts separately from
hypotheses. The worker drafts the plan using the existing report schema:

- Each case's user-visible outcome and connection to the requirement.
- Preconditions, actions, expected behavior, and explicit failure conditions.
- Required evidence types, capture strategy, and relevant dependencies.

Preserve supplied checks and stable IDs. The primary challenges omissions,
ambiguous expectations, and probes that cannot distinguish success from failure.
Discuss until material concerns are resolved; additional discussion needs a new
substantive question, not agreement for its own sake. Record the settled plan
before execution. Apply project approval gates within existing user authority;
internal agreement is not user authorization.

Agree up front on which failures stop dependent cases, which cases can continue
independently, and what requires renewed requirement discussion. The worker must
not silently weaken criteria to obtain a pass. Reopen the affected part of the
plan only when new evidence invalidates it or material ambiguity is discovered.

## 3. Execute autonomously; escalate exceptions

The worker executes the agreed cases, records observations and evidence, and
proceeds without waiting for primary approval after each case. It may use an
earlier case's observed result to run an agreed dependent case when that case's
precondition is satisfied. The primary does not monitor every artifact or repeat
successful execution. Shared fixtures and fault injections remain serialized.

Notify the primary when requirement ambiguity, a product failure, an environment
blocker, or an evidence problem prevents credible verification. Include affected
case IDs, expected versus observed behavior, tested revision, decisive evidence
paths, and the decision needed. Pause affected dependent cases; independent cases
may continue. Routine successful cases need no individual approval message.

Product repair belongs to the implementation owner: the primary or the existing
implementation agent. Keep the acceptance executor separate from the repairer;
the primary retains the final judgment even when it makes the repair itself.
After a repair, identify which earlier evidence the change invalidates and rerun
affected cases on the changed revision. Preserve unaffected evidence only with
its original revision and reuse clearly labeled; an earlier pass does not carry
across a relevant change. Missing evidence belongs to the executor, without implying
a product change. If probe repair repeats without new evidence or a credible next
step, escalate the concrete failure instead of continuing blind attempts.

Give each execution an attempt ID and preserve its evidence. Snapshot relevant
live-log excerpts rather than citing a growing log. Supplemental evidence from
the same execution may use new files; a rerun uses a new attempt ID. Record the
current attempt and exact evidence paths per case in the ledger, marking replaced
attempts so the final review does not confuse discarded and current results.

## Communicate completion; do not poll files

At dispatch, specify a parent-visible message/completion channel and a bounded
checkpoint for long work. Worker-local commentary may not reach the primary.
Use notifications for exceptions, an agreed long-work checkpoint, report readiness,
and cleanup completion. Writing files alone is not a handoff. If the host only
delivers terminal results, return at the agreed checkpoint and continue the same
worker role using native resume or the ledger; do not force one dispatch per case.

The primary waits for notifications and reads cited files to make decisions, not
to infer progress. Do not repeatedly list directories, check modification times,
or reopen unfinished drafts. On an overdue checkpoint, ask the running worker
once for its operation/session and blocker if the host supports that channel.
Otherwise, or if delivery fails, inspect the ledger and recorded process. Silence
alone does not establish that a worker died; verify before interrupting it.

## 4. Primary reviews the completed round

The worker sends a report-ready handoff after checking plan/case mapping and
evidence references. Every planned case must have an explicit outcome, including
blocked or unexecuted cases. Supply completed report paths, the attempt ledger,
tested revisions, evidence reuse, and cleanup state. Keep submitted evidence and
the report stable while the primary reviews them.

The primary reviews the whole requirement, plan, and original evidence at this
point. Open the screenshots, inspect temporal evidence for flicker or transitions,
and check request/output records for behavioral claims. A worker's pass label is
not proof. Check missing required evidence, contradictions, stale revisions, and
ineffective injection. Apply the skill's living-log checklists and record case
decisions in the report; a final review still covers every case.

Route findings to the implementer or executor as above. Review corrected evidence
and affected conclusions without rerunning unrelated passing cases or restarting
the entire review. The primary executes publication and owns the final handoff
for both authored and plan-driven rounds. Publish only after its final review is complete,
with remaining failures or uncertainty reported explicitly. Follow the project's
cleanup sequence and collect cleanup completion before the final user handoff.
Published rounds remain immutable; repairs after publication create a new round.
For a plan-driven round, the worker stages evidence locally and the primary submits
only reviewed attempts after the complete review, following
[plan-format.md](plan-format.md#review-before-submission). Server result IDs are not
attempt IDs; the local ledger preserves execution history.

## Reporting

Keep the existing plan/case/evidence schema. The narrative tail records who
implemented, executed, and performed the final review, worker/run/model provenance,
tested revisions, reused evidence, and limitations. Distinguish independent
execution from builder self-verification. Do not create a separate final audit
agent or claim that one reviewed this round. If delegation is unavailable or prohibited, the primary
may execute within authority and disclose the missing independent execution.
