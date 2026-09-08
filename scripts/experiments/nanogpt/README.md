# nanoGPT agentic 语料对照实验

在本机用上游 [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT) @ `3adf61e` 复现完整本地流程
(数据 → tokenize → 训练 → checkpoint → resume → 采样 → held-out 评估), 并比较三类语料的
next-byte 可预测性：公共普通文本 vs 个人 agentic 轨迹 (带 / 不带角色标记)。

## 文件

| 文件                                            | 作用                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `selection_rule.md`                             | agentic 语料选择规则 (先于抓取冻结；个人 ID 在私有 selection.json)                      |
| `selection.example.json`                        | 私有选择文件的占位示例 (复制到 `.records/nanogpt/private/selection.json` 并填入真实 ID) |
| `fetch_agentic.py`                              | 经 `lh` CLI 抓 topic / 消息，raw 只落盘不打印                                           |
| `fetch_public.sh`                               | 下载公共领域 tiny-shakespeare 并记录 hash                                               |
| `build_corpus.py`                               | 脱敏 → 共享消息片段 ledger → topic 级 70/15/15 → 去重 → byte257 bin                     |
| `test_corpus_invariants.py`                     | 语料不变量可执行测试 (合成夹具)                                                         |
| `test_payload_markers.py` / `test_eval_loss.py` | 回归测试 (正文含类标记文本 / EOT 排除口径)                                              |
| `eval_loss.py`                                  | 独立 held-out 评估 (冻结窗口，NLL + bits/byte)                                          |
| `run_matrix.py`                                 | 编排:smoke /train/resume/sample/eval                                                    |

## 复跑

以下命令在仓库根目录执行，首次运行使用新的 `.records/nanogpt` 目录。Python 依赖为本次验证的 torch 2.8.0、numpy 2.0.2；训练设备为 Apple MPS。个人数据与权重不公开，因此公开材料可复跑流程，不能独立重建本次私人语料。已保留本地 bins 时可直接复算评估，避免重新抽样。

```bash
mkdir -p .records/nanogpt/private .records/nanogpt/logs
# 首次准备上游；已有本次 upstream 时跳过 clone/checkout/apply
git clone https://github.com/karpathy/nanoGPT.git .records/nanogpt/upstream
git -C .records/nanogpt/upstream checkout 3adf61e154c3fe3fca428ad6bc3818b27a3b8291
git -C .records/nanogpt/upstream apply "$PWD/scripts/experiments/nanogpt/upstream.diff"
cp scripts/experiments/nanogpt/selection.example.json .records/nanogpt/private/selection.json
# 编辑私有 selection.json，填入自己账号的 agent/topic ID；lh 必须已登录。
python3 scripts/experiments/nanogpt/test_corpus_invariants.py
python3 -m unittest discover -s scripts/experiments/nanogpt -p 'test_*.py'
python3 scripts/experiments/nanogpt/fetch_agentic.py
bash scripts/experiments/nanogpt/fetch_public.sh
python3 scripts/experiments/nanogpt/build_corpus.py
# 首次初始化进度文件。复用已有实验时不要覆盖它。
python3 -c 'import json,pathlib; pathlib.Path(".records/nanogpt/progress.json").write_text(json.dumps({"phases": {}}))'
python3 scripts/experiments/nanogpt/run_matrix.py all
# 对本次已有的九个模型，仅重新评估：
python3 scripts/experiments/nanogpt/run_matrix.py eval
```

`protocol.record.json` 是本次冻结协议的副本。新数据运行应另存自己的协议与数据哈希，不沿用本次结果或冻结声明。`run_matrix.py train` 会按 run\_id 跳过已有结果；开始新的对照时使用新的记录目录，不混用旧模型。采样输出文件包含上游 stdout 头部，文件大小不是纯生成文本字节数。

## 关键设计

- **共享 ledger**: 每条消息切成 header/body/toolmark 段；截断、去重都作用于 ledger,
  `agentic_full` 与 `agentic_norole` 是同一 ledger 的两种渲染，正文逐字节一致 (构建时逐 topic 断言)。
- **精确 update 计数**: 上游终止条件为 `iter_num > max_iters`, 故正式 run 用 `--max_iters=1999`
  得到恰好 2000 次 optimizer update (4,096,000 tokens); 上游 patch 在循环结束保存 `ckpt_final.pt`。
- **resume**: 段 A `--max_iters=1000` 在 iter 1000 顶部落 `ckpt.pt`(恰 1000 updates 后的状态，
  其后第 1001 次 update 被丢弃); 段 B `init_from=resume` 用同一 2000 步 LR 计划续训 iter 1000..1999。
- **评估口径**:`bits_per_byte_excl_eot` 分子分母均排除 EOT 目标，是公开主指标；
  另报含 EOT 的 bits/token。val 仅监控，不用于选 ckpt。

详细协议与修订记录见 `.records/nanogpt/protocol.json`(训练前冻结，hash 在 `protocol.sha256`)。

## 隐私

raw / 脱敏语料 /bin/checkpoint/ 样本全部留在 `.records/nanogpt/private/`, 不入库不发布；
公开聚合 (`.records/nanogpt/public/`) 只含白名单字段 (opaque run id、arm/seed、超参、指标、
耗时、hash、命令模板)。本目录代码不含任何个人 ID。

## Goal 端到端验收

[研究验收第 2 轮](https://app.lobehub.com/acceptance/0392da18-016d-40dc-ae9c-cae848eee75b?r=2) 复用本目录的数据准备与评估工具，由 Goal 调度 Kimi Code 新跑 public\_plain /agentic\_full 两臂，各 seed 1337、2000 次更新、4,096,000 byte-token 曝光。产物另存 `.records/nanogpt-goal-e2e`；本目录三臂三 seed 的 `protocol.record.json` 记录的是前一轮协议，不是本轮 Goal 的执行范围。

本轮独立参数量为 836,864（共享 embedding /lm\_head 不重复计数）。在同一个人轨迹测试集，两模型 BPB 分别为 8.488657 与 3.148964；在同一公共测试集分别为 2.808069 与 3.995108。四个数值均经独立重新评估核对。该结果仅表明本次分布内预测学习价值，不能证明 Agent 任务成功率提升、轨迹结构的因果收益或混合预训练收益。

Goal 自动完成最终验收并进入 achieved，但期间有人工修复、重试与报告纠错。整体验收为部分通过：科学结果与图导航通过，自主执行项不通过。运行链路修复与实验容器 UI 见 [Goal PR #19261](https://github.com/lobehub/lobehub/pull/19261)。
