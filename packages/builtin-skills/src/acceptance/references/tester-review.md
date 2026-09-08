# Tester review handoff

Use a tester to catch missing cases and unsupported pass claims. The primary
owns environment preparation, execution, evidence inspection, repairs, cleanup,
and publication. The tester reviews the plan and final evidence only. Reuse one
tester through both stages and follow-ups when supported; otherwise provide the
same handoff and prior findings to its replacement. Never assume a role name or
model parameter exists: use the current host's supported agent controls. Record
the actual selection when known; an inherited model does not imply lower cost.

## Shared contract

Send a compact message with the stage, target revision/diff range, source paths,
and requested output below. Reference existing plan/report files; do not create
a second JSON schema or duplicate case tables. Keep review notes in the ignored
acceptance directory and summarize the review in the existing narrative tail.
Save the requirement-to-case mapping in those review notes and include its path
in both handoffs; do not add a new field to the report schema.

Both stages receive original requirement and feedback sources, including relevant
screenshots and explicit scope decisions. Prefer source links, local message
records, or verbatim excerpts over a rewritten implementation summary. Label
unavailable sources and summaries; never invent a transcript. The tester must
state coverage limits if the supplied sources are incomplete. Do not send the
entire implementation conversation when focused source material is available.

The tester starts with these inputs and reads related code only to resolve a
specific gap or contradiction. It may inspect files, the specified Git diff,
logs, and media metadata, or extract frames into an ignored review directory.
It must not start services, change fixtures, run product cases, repair probes,
edit product code, publish, or spawn other agents. Missing/unreadable artifacts
are returned to the primary, not an invitation to debug the environment.

## 1. Plan review

Primary input:

- Original sources and agreed non-goals, separately from implementation hypotheses.
- Exact code revision and diff range; relevant implementation decisions.
- Draft plan using the existing schema, with stable case IDs, requirement mapping,
  preconditions, operations, observable expectations, and evidence requirements.
  Put additional explanation in existing method/text fields or handoff notes.

Tester procedure: read the original sources first and list the outcomes they
require, then compare that list with the draft cases and relevant diff. Look for
missing boundaries, ambiguous criteria, and probes that cannot distinguish success
from failure. Check how fixtures/fault injections will be proven effective.
Also identify duplicate or out-of-scope cases; review must not only expand scope.

Tester output:

- Decision: ready, or changes needed.
- Requirement-to-case coverage, including uncovered requirements and source limits.
- Findings: source/case ID, gap or unnecessary case, reason, minimal proposed change.
  If none, say so; do not rewrite the whole plan.

The primary resolves material findings before execution and saves the agreed plan.
Existing authorization and project approval rules still apply. For frozen plans,
record uncovered requirements in review notes and the final handoff; do not add
items or switch report modes within that round. If a required outcome cannot be
verified under the supplied plan, report the limitation and request a corrected
plan from its owner rather than claiming full acceptance.

## 2. Final evidence review

Primary input:

- Original sources again, agreed plan, saved requirement mapping and plan-review
  findings, and any subsequent scope/plan changes.
- Completed report and per-case evidence index: expected behavior, actual observation,
  tested revision, original artifact paths, and the primary's proposed result.
- Runtime/build provenance, fixture/injection evidence, unexecuted cases, reused
  evidence and its original revision, and known limitations. File timestamps or
  a checkout SHA alone do not prove which build produced a screenshot.
  Correlate the target revision with the running instance's build/version marker,
  or probe a changed value in that instance that distinguishes it from the old
  implementation. State limits when exact build identity cannot be established.
- For temporal claims, the original clip plus available timestamped frame sequence
  and relevant intervals. Selected assertion frames are navigation aids, not proof
  that the intervening transition was correct.

Tester procedure: start with requirements and expectations, inspect the original
evidence, then compare with the primary's observations and verdict. Open images;
file existence and captions are not visual verification. For flicker or transitions,
inspect the relevant sequence, extracting frames if necessary. Do not claim to
have watched a video when only stills were inspected. State sampling limits; sparse
frames cannot establish the absence of a one-frame defect. Recheck coverage against
original sources, not only against the agreed plan.

Tester output:

- For every case: what the evidence shows, inspected paths/intervals, whether it
  meets the expectation, and whether the primary's proposed result is supported.
  Keep passing entries brief. For a disagreement or insufficient evidence, cite
  the specific frame, timestamp, log excerpt, or missing artifact.
- Action for each finding: supplement evidence, rerun, or repair then rerun.
- Overall decision: evidence supports acceptance, or further work is required;
  include uncovered requirements and inspection limitations.

These are review notes, not new report status values. The primary maps unresolved
findings to the existing schema without treating missing evidence as a pass. A
tester label alone is not proof, and the primary must not silently override a
supported objection. Resolve it with evidence or disclose the unresolved finding.

## Follow-up

The primary repairs or collects evidence. Send the repair diff, proposed affected
cases, new artifacts and prior findings to the same tester. The tester verifies
the affected set against the diff and may add missed regressions, then reviews
only affected conclusions. Preserve unaffected results with their original
provenance. Published rounds remain immutable; follow existing new-round rules.
No per-case approval loop, independent execution worker, or third audit agent.
