import type { GoalGraphSnapshot } from '@lobechat/types';

import type { TrpcClient } from '../../api/client';

type SeedTask = string | { description?: string; title: string };

/** Seed task title → titles of the seed tasks it waits for. */
export type SeedDependencies = Map<string, string[]>;

/**
 * `--task-file`: a JSON array of seed tasks, each a title or
 * {"title","description","dependsOn"}. `dependsOn` names other entries of the
 * same file by title, so a seeded graph arrives with its order in place.
 */
export const parseTaskFile = (
  raw: string,
): { dependencies: SeedDependencies; tasks: SeedTask[] } => {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('--task-file must hold a JSON array');
  const dependencies: SeedDependencies = new Map();
  const tasks = parsed.map((item, index): SeedTask => {
    if (typeof item === 'string' && item.trim()) return item.trim();
    if (!item || typeof item !== 'object' || typeof item.title !== 'string' || !item.title.trim())
      throw new Error(`--task-file entry ${index} needs a title`);
    const title = item.title.trim();
    if (item.dependsOn !== undefined) {
      if (
        !Array.isArray(item.dependsOn) ||
        !item.dependsOn.every((dep: unknown) => typeof dep === 'string')
      )
        throw new Error(`--task-file entry ${index}: dependsOn must be an array of task titles`);
      dependencies.set(
        title,
        item.dependsOn.map((dep: string) => dep.trim()),
      );
    }
    return {
      description: typeof item.description === 'string' ? item.description : undefined,
      title,
    };
  });

  const titles = tasks.map((task) => (typeof task === 'string' ? task : task.title));
  if (dependencies.size > 0) {
    const duplicate = titles.find((title, index) => titles.indexOf(title) !== index);
    if (duplicate)
      throw new Error(`--task-file: "${duplicate}" appears twice, so dependsOn cannot name it`);
    for (const [title, deps] of dependencies) {
      for (const dep of deps) {
        if (!titles.includes(dep))
          throw new Error(`--task-file: "${title}" depends on "${dep}", which is not in the file`);
        if (dep === title) throw new Error(`--task-file: "${title}" cannot depend on itself`);
      }
    }
  }
  return { dependencies, tasks };
};

/**
 * Draw each seed's `dependsOn` as a `depends_on` edge on the created graph and
 * add the edges to it, so the graph printed afterwards shows them.
 */
export const linkSeedDependencies = async (
  client: TrpcClient,
  graph: GoalGraphSnapshot,
  dependencies: SeedDependencies,
) => {
  if (dependencies.size === 0) return;
  const nodeIdByTitle = new Map(
    graph.nodes.filter((node) => node.kind === 'task').map((node) => [node.title, node.id]),
  );
  const nodeId = (title: string) => {
    const id = nodeIdByTitle.get(title);
    if (!id) throw new Error(`Seed task "${title}" is not on goal ${graph.goal.id}`);
    return id;
  };
  for (const [title, deps] of dependencies) {
    for (const dep of deps) {
      const { data } = await client.goal.addEdge.mutate({
        id: graph.goal.id,
        kind: 'depends_on',
        sourceNodeId: nodeId(title),
        targetNodeId: nodeId(dep),
      });
      graph.edges.push(data);
    }
  }
};
