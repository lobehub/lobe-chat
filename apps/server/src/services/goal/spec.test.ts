import { describe, expect, it } from 'vitest';

import {
  evaluateHomogeneity,
  HOMOGENEITY_MIN_SIMILARITY,
  maskConcreteNames,
  minPairwiseSimilarity,
  uncoveredAxisValues,
} from './spec';

describe('maskConcreteNames', () => {
  it('masks paths, identifiers and numbers so one recipe reads the same twice', () => {
    const a = maskConcreteNames('Migrate src/store/userStore.ts using the same 3 steps');
    const b = maskConcreteNames('Migrate src/store/topicStore.ts using the same 3 steps');
    expect(a).toBe(b);
  });
});

describe('minPairwiseSimilarity', () => {
  it('is 1 for briefs that are one masked shape', () => {
    const similarity = minPairwiseSimilarity([
      { instruction: 'Move src/a.ts to the new API', title: 'Migrate A' },
      { instruction: 'Move src/b.ts to the new API', title: 'Migrate B' },
    ]);
    expect(similarity).toBeGreaterThanOrEqual(HOMOGENEITY_MIN_SIMILARITY);
  });

  it('falls below the threshold for unrelated briefs', () => {
    const similarity = minPairwiseSimilarity([
      { instruction: 'Write a benchmark paper', title: 'Paper' },
      { instruction: 'Provision a Postgres cluster', title: 'Infra' },
    ]);
    expect(similarity).toBeLessThan(HOMOGENEITY_MIN_SIMILARITY);
  });
});

describe('minPairwiseSimilarity on real planner briefs', () => {
  /**
   * Regression: real planner output for one recipe — the first probe long
   * (references, deliverables), the next short and pointing back — read as
   * different work, so a Chinese goal never became a batch. Chinese clauses
   * were single tokens, and Jaccard punished the length gap.
   */
  it('reads a long and a short Chinese brief of one recipe as one mould', () => {
    const similarity = minPairwiseSimilarity([
      {
        instruction:
          '以仓库内已迁移到 @lobechat/replica 的 store 为参照，对 src/store 下的 device 和 toolPayload 两个 store 各执行下列相同步骤：1) 为该 store 定义 replica；2) 把使用该 store 的组件改为从 store selector 读取数据；3) 删除该 store 的 SWR 持久化条目；4) 补一个冷启动「先显示上次缓存数据」的回归测试。交付物是两个 store 均已迁移、`pnpm test` 与类型检查通过的可运行代码，并给出每个 store 迁移前后数据读取路径的对照说明。判定标准：组件不再直接引用 SWR 持久化缓存，而是经 selector 从 replica 读取；删除的 SWR 持久化条目被真正移除；新增回归测试通过。',
        title: '迁移 device 与 toolPayload store（探针）',
      },
      {
        instruction:
          '对 src/store 下的 projectSkills 与 homeInbox 两个 store 各执行：1) 定义 replica；2) 组件改为从 store selector 读取；3) 删除该 store 的 SWR 持久化条目；4) 补冷启动「先显示上次数据」回归测试。参照已迁移的 device/toolPayload 探针成果保持一致。交付物：两个 store 迁移完成、测试与类型检查通过。判定：组件仅经 selector 从 replica 读取，SWR 持久化条目已删除，冷启动回归测试通过。',
        title: '迁移 projectSkills 与 homeInbox store',
      },
    ]);
    expect(similarity).toBeGreaterThanOrEqual(HOMOGENEITY_MIN_SIMILARITY);
  });

  it('still tells two different pieces of Chinese work apart', () => {
    const similarity = minPairwiseSimilarity([
      {
        instruction:
          '为目标页设计新的空状态插画，补齐中英文文案，并在浅色和深色主题下各截一张图交给设计评审。',
        title: '设计目标页空状态',
      },
      {
        instruction:
          '把生产数据库从 Postgres 15 升级到 17，先在预发环境演练回滚，再安排维护窗口并更新运维手册。',
        title: '升级生产数据库',
      },
    ]);
    expect(similarity).toBeLessThan(HOMOGENEITY_MIN_SIMILARITY);
  });

  /**
   * Regression: the score only measured how much of the shorter brief the
   * longer one covered, so a probe that piled other work on top of the shared
   * recipe still read as the same mould.
   */
  it('counts the other work a longer brief piles on top of the shared recipe', () => {
    const recipe = '对该 store 执行：定义 replica；组件改为从 selector 读取；删除 SWR 持久化条目。';
    const similarity = minPairwiseSimilarity([
      { instruction: recipe, title: '迁移 device' },
      {
        instruction: `${recipe}另外把服务端接口从 REST 改成 tRPC，重写鉴权中间件，新增数据库迁移把表拆成两张并回填历史数据，更新管理后台的导出报表，补齐运维告警与值班手册，再给支付回调加上幂等校验和重试队列。`,
        title: '迁移 brief',
      },
    ]);
    expect(similarity).toBeLessThan(HOMOGENEITY_MIN_SIMILARITY);
  });

  it('does not let a one-line brief pass by sitting inside a long one', () => {
    const similarity = minPairwiseSimilarity([
      { instruction: 'Fix the tests', title: 'Fix' },
      {
        instruction:
          'Rewrite the billing service on the new queue, fix the tests it breaks, migrate the invoices table and document the rollout for the support team.',
        title: 'Rewrite billing',
      },
    ]);
    expect(similarity).toBeLessThan(HOMOGENEITY_MIN_SIMILARITY);
  });
});

describe('evaluateHomogeneity', () => {
  const spec = {
    recipeOutline: 'Replace the store with the replica-backed one',
    repeatable: true,
    unitCount: 50,
    units: Array.from({ length: 50 }, (_, i) => `Migrate ${i + 1}`),
    variants: [],
  };
  const probes = [
    { instruction: 'Migrate src/a.ts the same way', title: 'Migrate A' },
    { instruction: 'Migrate src/b.ts the same way', title: 'Migrate B' },
  ];

  it('accepts one repeated mould above the threshold', () => {
    expect(evaluateHomogeneity(spec, probes).batch).toBe(true);
  });

  it('accepts a roster within the caller’s batch cap', () => {
    expect(evaluateHomogeneity(spec, probes, { maxUnits: 60 }).batch).toBe(true);
  });

  it('refuses a roster above the batch cap so nothing is silently trimmed', () => {
    const verdict = evaluateHomogeneity(
      { ...spec, unitCount: 65, units: Array.from({ length: 65 }, (_, i) => `Migrate ${i + 1}`) },
      probes,
      { maxUnits: 60 },
    );
    expect(verdict.batch).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('above the batch cap of 60');
  });

  it('refuses a claim that is not repeatable', () => {
    expect(evaluateHomogeneity({ ...spec, repeatable: false }, probes).batch).toBe(false);
  });

  it('refuses a roster below the homogeneous-unit threshold', () => {
    expect(evaluateHomogeneity({ ...spec, unitCount: 2 }, probes).batch).toBe(false);
  });

  it('refuses probes that are not one mould', () => {
    const verdict = evaluateHomogeneity(spec, [
      { instruction: 'Write a benchmark paper', title: 'Paper' },
      { instruction: 'Provision a Postgres cluster', title: 'Infra' },
    ]);
    expect(verdict.batch).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('one reusable transformation');
  });

  it('refuses a claim whose roster does not list every claimed unit', () => {
    const verdict = evaluateHomogeneity({ ...spec, units: ['Migrate 1', 'Migrate 2'] }, probes);
    expect(verdict.batch).toBe(false);
    expect(verdict.reasons.join(' ')).toContain('roster lists 4 of the 50 claimed units');
  });

  it('refuses a claim with no recipe outline', () => {
    expect(evaluateHomogeneity({ ...spec, recipeOutline: undefined }, probes).batch).toBe(false);
  });
});

describe('uncoveredAxisValues', () => {
  it('reports a declared value no probe touches', () => {
    const gaps = uncoveredAxisValues(
      [{ axis: 'cold-start', values: ['yes', 'no'] }],
      [{ instruction: 'Handle a cold-start yes path', title: 'Probe' }],
    );
    expect(gaps).toEqual([{ axis: 'cold-start', value: 'no' }]);
  });

  it('reports nothing when every value is covered', () => {
    const gaps = uncoveredAxisValues(
      [{ axis: 'mode', values: ['cold-start'] }],
      [{ instruction: 'Handle a cold-start path', title: 'Probe' }],
    );
    expect(gaps).toEqual([]);
  });

  it('does not let an unrelated word satisfy a short variant value', () => {
    // `no` must not be covered by `node` / `nothing` — otherwise an all-`yes`
    // probe set would green the gate without ever testing the `no` variant.
    const gaps = uncoveredAxisValues(
      [{ axis: 'cold-start', values: ['no'] }],
      [{ instruction: 'Handle a node route with nothing cold', title: 'Probe' }],
    );
    expect(gaps).toEqual([{ axis: 'cold-start', value: 'no' }]);
  });
});
