#!/usr/bin/env python3
"""实验编排:冒烟 → 9 个正式 run → resume 验证 → 采样 → 交叉评估。

用法:
  python3 run_matrix.py smoke    # 管道冒烟 + seed 生效验证 + resume 机制验证
  python3 run_matrix.py train    # 9 个正式 run(串行),每 run 完成即更新 results.json/progress.json
  python3 run_matrix.py resume   # resume 证明:1000 → 2000(完整 2000 步 LR 计划)
  python3 run_matrix.py sample   # 每 arm(seed 1337)采样,样本留 private
  python3 run_matrix.py eval     # 9 ckpt × 3 冻结 test set 交叉评估
  python3 run_matrix.py all

所有命令模板与 stdout 日志落 .records/nanogpt/logs/;不打印任何语料正文。
"""
import hashlib
import json
import re
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REC = ROOT / '.records' / 'nanogpt'
PRIV = REC / 'private'
UPSTREAM = REC / 'upstream'
LOGS = REC / 'logs'
RESULTS = REC / 'results.json'
PROGRESS = REC / 'progress.json'

ARMS = {
    'public_plain': '../../data/bins/public_plain',
    'agentic_full': '../../private/bins/agentic_full',
    'agentic_norole': '../../private/bins/agentic_norole',
}
TEST_BINS = {
    'public': REC / 'data' / 'bins' / 'public_plain' / 'test.bin',
    'agentic_full': PRIV / 'bins' / 'agentic_full' / 'test.bin',
    'agentic_norole': PRIV / 'bins' / 'agentic_norole' / 'test.bin',
}
SEEDS = [1337, 2024, 4242]

BASE_ARGS = [
    '--device=mps', '--dtype=float32', '--compile=False',
    '--n_layer=4', '--n_head=4', '--n_embd=128', '--block_size=128',
    '--batch_size=16', '--gradient_accumulation_steps=1',
    '--dropout=0.0', '--bias=False',
    '--learning_rate=6e-4', '--lr_decay_iters=2000', '--warmup_iters=100', '--min_lr=6e-5',
    '--weight_decay=0.1', '--beta1=0.9', '--beta2=0.95', '--grad_clip=1.0',
    '--eval_interval=500', '--eval_iters=100', '--log_interval=1',
    '--always_save_checkpoint=True', '--wandb_log=False',
]


def sha256_file(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def update_progress(**kw):
    p = json.loads(PROGRESS.read_text())
    p['phases'].update(kw)
    p['updated_at'] = time.strftime('%Y-%m-%dT%H:%M:%S%z')
    PROGRESS.write_text(json.dumps(p, ensure_ascii=False, indent=1))


def append_result(entry):
    r = json.loads(RESULTS.read_text()) if RESULTS.exists() else {'runs': [], 'resume': None,
                                                                  'samples': [], 'eval': None}
    r['runs'].append(entry)
    RESULTS.write_text(json.dumps(r, ensure_ascii=False, indent=1))


def run_train(tag, dataset, out_dir, seed, extra_args, timeout=7200):
    """调用上游 train.py;返回 (log_path, elapsed_s, parsed)。"""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    log_path = LOGS / f'{tag}.log'
    cmd = ['python3', 'train.py', f'--dataset={dataset}', f'--out_dir={out_dir}',
           f'--seed={seed}'] + BASE_ARGS + extra_args
    t0 = time.time()
    with open(log_path, 'w') as lf:
        lf.write('# cmd: ' + ' '.join(cmd) + '\n')
        lf.flush()
        r = subprocess.run(cmd, cwd=UPSTREAM, stdout=lf, stderr=subprocess.STDOUT, timeout=timeout)
    elapsed = time.time() - t0
    if r.returncode != 0:
        raise RuntimeError(f'{tag} 训练失败,见 {log_path}')
    text = log_path.read_text()
    iters = re.findall(r'^iter (\d+): loss ([\d.]+)', text, re.M)
    steps = re.findall(r'^step (\d+): train loss ([\d.]+), val loss ([\d.]+)', text, re.M)
    parsed = {
        'n_train_updates_logged': len(iters),
        'first_iter': int(iters[0][0]) if iters else None,
        'last_iter': int(iters[-1][0]) if iters else None,
        'final_train_loss': float(iters[-1][1]) if iters else None,
        'val_curve': [{'iter': int(s[0]), 'train': float(s[1]), 'val': float(s[2])} for s in steps],
    }
    return log_path, elapsed, parsed


def run_id(arm, seed):
    return f'{arm}__s{seed}'


def smoke():
    print('== smoke: 20 更新小跑 ==')
    log, el, parsed = run_train('smoke_public_s1337', ARMS['public_plain'],
                                PRIV / 'runs' / 'smoke', 1337,
                                ['--max_iters=19', '--eval_interval=10', '--eval_iters=5'])
    ck = PRIV / 'runs' / 'smoke' / 'ckpt_final.pt'
    assert ck.exists(), 'ckpt_final.pt 未生成'
    import torch
    ckpt = torch.load(ck, map_location='cpu', weights_only=False)
    assert ckpt['iter_num'] == 20, f"最终 iter_num={ckpt['iter_num']} != 20(精确 update 计数失败)"
    assert parsed['n_train_updates_logged'] == 20, parsed['n_train_updates_logged']
    print(f'  OK 20 updates, ckpt_final iter_num=20, {el:.0f}s')

    print('== smoke: seed 生效验证(3 updates × 3 次)==')
    losses = {}
    for tag, seed in (('a', 1337), ('b', 1337), ('c', 2024)):
        log, _, p = run_train(f'smoke_seed_{tag}', ARMS['public_plain'],
                              PRIV / 'runs' / f'smoke_seed_{tag}', seed,
                              ['--max_iters=2', '--eval_interval=1000', '--eval_iters=2'])
        text = log.read_text()
        losses[tag] = re.findall(r'^iter 0: loss ([\d.]+)', text, re.M)[0]
    assert losses['a'] == losses['b'], f"同 seed 不可复现: {losses}"
    assert losses['a'] != losses['c'], f"seed 未生效: {losses}"
    print(f"  OK seed 复现性: {losses}")

    print('== smoke: resume 机制(10 → 20)==')
    rd = PRIV / 'runs' / 'smoke_resume'
    # 段 A:max_iters=10 + eval_interval=10 → ckpt.pt 在 iter 10 顶部保存(=10 updates 后的状态)
    run_train('smoke_resume_a', ARMS['public_plain'], rd, 1337,
              ['--max_iters=10', '--eval_interval=10', '--eval_iters=2'])
    _, _, pb = run_train('smoke_resume_b', ARMS['public_plain'], rd, 1337,
                         ['--init_from=resume', '--max_iters=19', '--eval_interval=10',
                          '--eval_iters=2'])
    assert pb['first_iter'] == 10, f"resume 起点={pb['first_iter']} != 10"
    assert pb['n_train_updates_logged'] == 10, pb['n_train_updates_logged']
    ckpt = torch.load(rd / 'ckpt_final.pt', map_location='cpu', weights_only=False)
    assert ckpt['iter_num'] == 20
    print('  OK resume: iter 10 → 20,额外 10 updates')
    update_progress(smoke={'status': 'done', 'detail': '20 更新小跑+seed 复现+resume 机制均通过'})


def train():
    done = {r['run_id'] for r in json.loads(RESULTS.read_text())['runs']} if RESULTS.exists() else set()
    n = 0
    for arm, dataset in ARMS.items():
        for seed in SEEDS:
            rid = run_id(arm, seed)
            if rid in done:
                print(f'  skip {rid}(已完成)')
                n += 1
                continue
            print(f'== train {rid} ==')
            out_dir = PRIV / 'runs' / rid
            log, el, parsed = run_train(rid, dataset, out_dir, seed, ['--max_iters=1999'])
            ck = out_dir / 'ckpt_final.pt'
            assert parsed['n_train_updates_logged'] == 2000, parsed['n_train_updates_logged']
            entry = {
                'run_id': rid, 'arm': arm, 'seed': seed,
                'updates': 2000, 'tokens': 4_096_000,
                'elapsed_s': round(el, 1),
                'final_train_loss': parsed['final_train_loss'],
                'val_curve': parsed['val_curve'],
                'ckpt_final_sha256': sha256_file(ck),
                'ckpt_final_iter_num': 2000,
                'log': f'logs/{rid}.log',
                'status': 'ok',
            }
            append_result(entry)
            n += 1
            update_progress(train_runs={'status': 'in_progress' if n < 9 else 'done',
                                        'done': n, 'total': 9})
            print(f'  OK {rid} loss={parsed["final_train_loss"]} {el:.0f}s ({n}/9)')


def resume():
    print('== resume 证明: agentic_full s1337, 1000 → 2000(完整 2000 步 LR 计划)==')
    rd = PRIV / 'runs' / 'resume_agentic_full_s1337'
    # 段 A:max_iters=1000 → 1001 updates,但 ckpt.pt 在 iter 1000 顶部保存(=恰好 1000 updates 后的状态),
    # 多出的第 1001 次 update 发生在保存之后,其结果被丢弃(resume 从 ckpt.pt 读取)。
    log_a, el_a, pa = run_train('resume_a_agentic_full_s1337', ARMS['agentic_full'], rd, 1337,
                                ['--max_iters=1000', '--eval_interval=1000'])
    import torch
    cka = torch.load(rd / 'ckpt.pt', map_location='cpu', weights_only=False)
    assert cka['iter_num'] == 1000, cka['iter_num']
    assert 'optimizer' in cka and 'model' in cka
    # 段 B:resume,相同 LR 计划(warmup100 / cosine 至 2000 / min 6e-5),iter 1000..1999 = 额外 1000 updates
    log_b, el_b, pb = run_train('resume_b_agentic_full_s1337', ARMS['agentic_full'], rd, 1337,
                                ['--init_from=resume', '--max_iters=1999'])
    assert pb['first_iter'] == 1000, pb['first_iter']
    assert pb['n_train_updates_logged'] == 1000, pb['n_train_updates_logged']
    ckf = rd / 'ckpt_final.pt'
    ckpt = torch.load(ckf, map_location='cpu', weights_only=False)
    assert ckpt['iter_num'] == 2000, ckpt['iter_num']
    r = json.loads(RESULTS.read_text())
    r['resume'] = {
        'arm': 'agentic_full', 'seed': 1337,
        'segment_a': {'updates_logged': pa['n_train_updates_logged'],
                      'ckpt_iter_num': 1000, 'elapsed_s': round(el_a, 1),
                      'note': 'max_iters=1000 时进程共执行 1001 次 update;ckpt.pt 在第 1001 次之前'
                              '于 iter 1000 顶部保存,故 ckpt 状态恰为 1000 updates,多出的 1 次被丢弃',
                      'log': 'logs/resume_a_agentic_full_s1337.log'},
        'segment_b': {'init_from': 'resume(model+optimizer+iter_num)', 'first_iter': pb['first_iter'],
                      'additional_updates': pb['n_train_updates_logged'],
                      'final_iter_num': 2000, 'elapsed_s': round(el_b, 1),
                      'log': 'logs/resume_b_agentic_full_s1337.log'},
        'lr_schedule': '两段均 warmup_iters=100, lr_decay_iters=2000, min_lr=6e-5(完整 2000 步计划)',
        'bitwise_note': '不保证与不中断 run 逐位一致:resume 后 torch RNG 从 seed 重新播种,'
                        'data order / dropout 序列不与单次连续运行相同;model+optimizer+iter 均真实恢复',
        'ckpt_final_sha256': sha256_file(ckf),
        'val_curve_b': pb['val_curve'],
    }
    RESULTS.write_text(json.dumps(r, ensure_ascii=False, indent=1))
    update_progress(resume_proof={'status': 'done', 'detail': 'agentic_full s1337: 1000→2000,额外 1000 updates'})
    print('  OK resume 完成,额外 1000 updates,final iter_num=2000')


def sample():
    print('== 采样: 每 arm(seed 1337)==')
    sdir = PRIV / 'samples'
    sdir.mkdir(exist_ok=True)
    r = json.loads(RESULTS.read_text())
    for arm in ARMS:
        out_dir = PRIV / 'runs' / run_id(arm, 1337)
        prompt = '\n'
        log_path = LOGS / f'sample_{arm}.log'
        cmd = ['python3', 'sample.py', f'--out_dir={out_dir}', '--ckpt_name=ckpt_final.pt',
               '--device=mps', '--dtype=float32', '--num_samples=4', '--max_new_tokens=400',
               '--temperature=0.8', '--top_k=200', '--seed=1337', f'--start={prompt}']
        sample_file = sdir / f'{arm}__s1337.txt'
        with open(log_path, 'w') as lf, open(sample_file, 'w') as sf:
            lf.write('# cmd: ' + ' '.join(cmd) + '\n')
            lf.flush()
            p = subprocess.run(cmd, cwd=UPSTREAM, stdout=sf, stderr=lf, timeout=900)
        if p.returncode != 0:
            raise RuntimeError(f'{arm} 采样失败,见 {log_path}')
        blob = sample_file.read_bytes()
        r['samples'].append({
            'arm': arm, 'seed': 1337, 'success': True,
            'n_samples': 4, 'max_new_tokens': 400,
            'bytes': len(blob), 'sha256': hashlib.sha256(blob).hexdigest(),
            'note': '样本含私有语料风格内容,仅留 private/samples/,不发布',
        })
        print(f'  OK {arm}: {len(blob)} bytes')
    RESULTS.write_text(json.dumps(r, ensure_ascii=False, indent=1))
    update_progress(sampling={'status': 'done', 'detail': '3 arm 各 4 样本,留存 private'})


def evaluate():
    print('== 交叉评估: 9 ckpt × 3 冻结 test set ==')
    r = json.loads(RESULTS.read_text())
    matrix = {}
    for arm in ARMS:
        for seed in SEEDS:
            rid = run_id(arm, seed)
            ck = PRIV / 'runs' / rid / 'ckpt_final.pt'
            for tname, tbin in TEST_BINS.items():
                out = subprocess.run(
                    ['python3', str(ROOT / 'scripts' / 'experiments' / 'nanogpt' / 'eval_loss.py'),
                     '--ckpt', str(ck), '--bin', str(tbin), '--device=mps'],
                    capture_output=True, text=True, timeout=1800)
                if out.returncode != 0:
                    raise RuntimeError(f'eval {rid}×{tname} 失败: {out.stderr[:300]}')
                rec = json.loads(out.stdout)
                matrix.setdefault(rid, {})[tname] = {
                    'nll_per_token': rec['nll_per_token'],
                    'bits_per_byte_excl_eot': rec['bits_per_byte_excl_eot'],
                    'bits_per_token_incl_eot': rec['bits_per_token_incl_eot'],
                    'n_windows': rec['n_windows'],
                    'n_byte_targets_excl_eot': rec['n_byte_targets_excl_eot'],
                }
                print(f'  {rid} × {tname}: bpb={rec["bits_per_byte_excl_eot"]:.4f}')
    # 汇总:mean/std + 配对差值(同 seed 两两 arm 差)
    import statistics as st
    summary = {}
    for tname in TEST_BINS:
        per_arm = {}
        for arm in ARMS:
            vals = [matrix[run_id(arm, s)][tname]['bits_per_byte_excl_eot'] for s in SEEDS]
            per_arm[arm] = {'per_seed': dict(zip(map(str, SEEDS), vals)),
                            'mean': st.mean(vals), 'std': st.pstdev(vals)}
        paired = {}
        arms = list(ARMS)
        for i in range(len(arms)):
            for j in range(i + 1, len(arms)):
                a, b = arms[i], arms[j]
                diffs = [matrix[run_id(a, s)][tname]['bits_per_byte_excl_eot']
                         - matrix[run_id(b, s)][tname]['bits_per_byte_excl_eot'] for s in SEEDS]
                paired[f'{a}_minus_{b}'] = {'per_seed': dict(zip(map(str, SEEDS), diffs)),
                                            'mean': st.mean(diffs), 'std': st.pstdev(diffs)}
        summary[tname] = {'per_arm': per_arm, 'paired_diffs': paired}
    r['eval'] = {
        'method': 'eval_loss.py 独立脚本;冻结窗口(non-overlapping, offset 0, stride=128);'
                  'bpb 主指标排除 eot 目标(另报 bits/token 含 eot);ckpt 均为 ckpt_final.pt@2000',
        'matrix': matrix, 'summary_bpb_excl_eot': summary,
    }
    RESULTS.write_text(json.dumps(r, ensure_ascii=False, indent=1))
    update_progress(cross_eval={'status': 'done', 'detail': '9×3 矩阵 + mean/std + 配对差值'})
    print('  OK 评估矩阵完成')


def main():
    LOGS.mkdir(exist_ok=True)
    which = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if which in ('smoke', 'all'):
        smoke()
    if which in ('train', 'all'):
        train()
    if which in ('resume', 'all'):
        resume()
    if which in ('sample', 'all'):
        sample()
    if which in ('eval', 'all'):
        evaluate()


if __name__ == '__main__':
    main()
