# Tester review handoff

Use a tester to catch missing cases and unsupported pass claims. The primary
owns environment preparation, execution, evidence inspection, repairs, cleanup,
and publication. The tester appears at two points in the **first round only**:
plan review before execution, and a final evidence review before publishing.
It never operates the product, never repairs anything, and does not take part
in follow-up rounds. Reuse one tester across both stages when the host supports
it; otherwise give its replacement the same handoff and the prior findings.
Never assume a role name or model parameter exists: use the current host's
supported agent controls. Prefer the cheapest model capable of inspecting every
planned artifact, and record the actual selection when known; an inherited
model does not imply lower cost.

The tester replaces the user as the plan gate. Do not ask the user to approve
the plan; ask the user only for a user-owned prerequisite (a secret, a device or
2FA approval, a permission only they can grant, a destructive action) or a
product decision that materially changes the plan.

## Shared contract

Send one compact message per stage with the stage name, target revision and
diff range, source paths, and the requested output below. Reference the
existing plan/report files; do not create a second JSON schema or duplicate
case tables. Keep review notes in the ignored acceptance directory and
summarize the review in the existing narrative tail. Save the
requirement-to-case mapping in those review notes and include its path in both
handoffs; do not add a new field to the report schema.

The two stages get different inputs. **Plan review** receives the original
requirement and feedback sources — links, local message records, or verbatim
excerpts, including relevant screenshots and explicit scope decisions —
separately from implementation hypotheses, plus the specified diff range. Label
unavailable sources and summaries; never invent a transcript. Do not send the
entire implementation conversation when focused source material is available.
The tester must state coverage limits if the supplied sources are incomplete.
**Final evidence review** receives only the agreed plan, the report, the
artifacts, and their provenance — no sources, no diff range.

Give every handoff an explicit budget proportional to what it must read (plan
items, artifact count). The budget bounds wandering — code, environment,
re-planning — not artifact inspection: a tester that cannot open every cited
artifact within it says so as a coverage limit rather than skipping. The
tester's output is a checklist verdict, not a report of its own.

**Code reading is limited to the plan review, once.** The tester may read the
specified diff during plan review to understand which surfaces and states the
change touches; that is the only code it reads in either stage, and it serves
the case list, not a code review. In the evidence review the tester reads the
plan, the report, and the artifacts only. When the evidence contradicts the
report or the plan, the tester returns the contradiction to the primary; the
primary explains or repairs it. The tester does not go to the code to resolve
it.

The tester must not start services, change fixtures, run product cases, repair
probes, edit product code, publish, or spawn other agents. Missing or
unreadable artifacts are returned to the primary, not an invitation to debug
the environment.

## 1. Plan review

Primary input:

- Original sources and agreed non-goals.
- Exact code revision and diff range, plus a plain-language summary of what the
  change does and where it shows up.
- Draft plan using the existing schema, with stable case IDs, requirement mapping,
  preconditions, operations, observable expectations, and evidence requirements.
  Put additional explanation in existing method/text fields or handoff notes.

Tester procedure: read the original sources first and list the outcomes they
require, then compare that list with the draft cases, reading the diff once to
see which surfaces the change touches. Look for missing boundaries, ambiguous
criteria, and probes that cannot distinguish success from failure. Check how
fixtures/fault injections will be proven effective. Also identify duplicate or
out-of-scope cases; review must not only expand scope.

Tester output:

- Decision: ready, or changes needed.
- Requirement-to-case coverage, including uncovered requirements and source limits.
- Findings: source/case ID, gap or unnecessary case, reason, minimal proposed change.
  If none, say so; do not rewrite the whole plan.

The primary resolves material findings before execution and saves the agreed
plan with the resolutions. A "ready" decision — or "changes needed" with every
material finding resolved — is the plan gate; execution starts without asking
the user. For frozen plans, record uncovered requirements in review notes and
the final narrative tail; do not add items or switch report modes within that
round. If a required outcome cannot be verified under the supplied plan, report
the limitation and request a corrected plan from its owner rather than claiming
full acceptance.

## 2. Final evidence review

A quick pass against the agreed criteria: does each artifact show what its case
expects? No code, no re-planning. Complete every in-round repair and rerun
before this review so the tester sees the set that will be published.

Primary input:

- The agreed plan (with the plan-review resolutions folded in) and any
  subsequent scope/plan changes.
- Completed report and per-case evidence index: expected behavior, actual observation,
  tested revision, original artifact paths, and the primary's proposed result.
- Runtime/build provenance, fixture/injection evidence, unexecuted cases, reused
  evidence and its original revision, and known limitations. File timestamps or
  a checkout SHA alone do not prove which build produced a screenshot.
  Correlate the target revision with the running instance's build/version marker,
  or probe a changed value in that instance that distinguishes it from the old
  implementation. State limits when exact build identity cannot be established.
- Any repair made during the round, stated by the primary in plain language:
  which cases it affects and which artifacts are first-run versus re-run. The
  tester judges the re-run artifacts against the plan; it does not review the
  repair diff.
- For temporal claims, the original clip plus available timestamped frame sequence
  and relevant intervals. Selected assertion frames are navigation aids, not proof
  that the intervening transition was correct.

Tester procedure: start with each plan item's expectation, inspect the original
evidence, then compare with the primary's observations and verdict. Open images;
file existence and captions are not visual verification. For flicker or transitions,
inspect the relevant sequence, extracting frames if necessary. Do not claim to
have watched a video when only stills were inspected. State sampling limits; sparse
frames cannot establish the absence of a one-frame defect. Check that every
plan item has a result and every declared evidence type is present; do not
re-derive requirements from sources — that was the plan review's job.

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
Changes after the review are limited to what its findings require (supplement
evidence, rerun a case, repair then rerun); every artifact or verdict that
changed after the review is disclosed as primary-only in the narrative tail,
since the tester will not see it again.

## After the first round

The tester does not take part in follow-up rounds. When the primary repairs or
collects more evidence after the evidence review, or after user feedback on a
published round, it re-runs the affected cases, inspects the new artifacts
itself, discloses the repair in the narrative tail, and publishes the next
round. No tester review of any kind happens in a follow-up round. If scope,
surface, or business goal materially changes, the primary revises the plan
itself after obtaining any user-owned decision, and says so in the narrative
tail. Published rounds remain immutable; follow
existing new-round rules. No per-case approval loop, independent execution
worker, or third audit agent.
