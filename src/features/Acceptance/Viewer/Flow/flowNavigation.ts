import type { verifyService } from '@/services/verify';

import type { AcceptanceTabKey } from '../Header/AcceptanceTabs';

type Bundle = Awaited<ReturnType<typeof verifyService.getAcceptanceBundle>>;
export type FlowVersion = Bundle['flows'][number]['versions'][number];

export const getFlowNodeCount = (flows: Bundle['flows'] = []) =>
  flows.reduce(
    (sum, flow) => sum + (flow.versions.find((v) => v.nodes.length)?.nodes.length ?? 0),
    0,
  );

export const resolveAcceptanceTab = (
  tab: AcceptanceTabKey | undefined,
  nodeCount: number,
  reviewingPlan = false,
  flowAvailable = true,
): AcceptanceTabKey => {
  const selected = tab ?? (reviewingPlan ? 'flow' : 'checks');
  return selected === 'flow' && (!flowAvailable || nodeCount === 0) ? 'checks' : selected;
};

/** Round numbers come from the same acceptance ledger as the checklist. */
export const getFlowRoundViews = (flows: Bundle['flows'] = [], rounds: Bundle['rounds'] = []) => {
  const roundNumbers = new Map(rounds.map(({ run }) => [run.id, run.roundIndex]));
  const views: {
    id: string;
    roundIndex?: number;
    run?: FlowVersion['runs'][number];
    version: FlowVersion;
  }[] = [];
  for (const flow of flows) {
    const versions = flow.versions.filter((version) => version.nodes.length > 0);
    for (const version of versions) {
      if (version === versions[0] && version.runs.length === 0) {
        views.push({ id: version.id, version });
      }
      for (const run of version.runs) {
        const roundIndex = roundNumbers.get(run.verifyRunId);
        if (roundIndex != null)
          views.push({ id: `${version.id}:${run.id}`, roundIndex, run, version });
      }
    }
  }
  return views.sort((a, b) => (b.roundIndex ?? Infinity) - (a.roundIndex ?? Infinity));
};
