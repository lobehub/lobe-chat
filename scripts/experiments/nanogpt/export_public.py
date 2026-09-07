#!/usr/bin/env python3
"""生成公开聚合结果到 .records/nanogpt/public/。

只输出白名单字段:opaque run id、arm/seed、架构/超参、匿名计数、指标、耗时、
upstream/protocol/code hash、命令模板、phase 成功证明。
绝不包含:原始 topic id/正文、用户路径、凭据、样本/权重、未脱敏日志。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REC = ROOT / '.records' / 'nanogpt'
PUB = REC / 'public'

results = json.loads((REC / 'results.json').read_text())
corpus = json.loads((REC / 'corpus_stats.json').read_text())
progress = json.loads((REC / 'progress.json').read_text())
protocol_sha = (REC / 'protocol.sha256').read_text()

# opaque run id 映射(顺序固定,不含任何真实标识)
run_ids = sorted(r['run_id'] for r in results['runs'])
opaque = {rid: f'r{i + 1:02d}' for i, rid in enumerate(run_ids)}

runs = []
for r in sorted(results['runs'], key=lambda x: x['run_id']):
    rid = r['run_id']
    runs.append({
        'run_id': opaque[rid], 'arm': r['arm'], 'seed': r['seed'],
        'updates': r['updates'], 'train_tokens': r['tokens'],
        'elapsed_s': r['elapsed_s'],
        'final_train_loss': r['final_train_loss'],
        'val_curve': r['val_curve'],
        'ckpt_final_sha256': r['ckpt_final_sha256'],
        'ckpt_final_iter_num': r['ckpt_final_iter_num'],
        'status': r['status'],
    })

eval_matrix = {}
for rid, per_test in results['eval']['matrix'].items():
    eval_matrix[opaque[rid]] = per_test

out = {
    'experiment': 'nanogpt-agentic',
    'generated_at': progress['updated_at'],
    'upstream': {
        'repo': 'https://github.com/karpathy/nanoGPT',
        'commit': '3adf61e154c3fe3fca428ad6bc3818b27a3b8291',
        'patches': ['train.py: 可配置 seed', 'train.py: 循环末保存 ckpt_final.pt',
                    'sample.py: tiktoken 懒加载 + byte257 解码 + ckpt_name'],
        'loop': '上游原生训练循环,未替换',
    },
    'protocol_sha256': protocol_sha,
    'arch': {'n_layer': 4, 'n_head': 4, 'n_embd': 128, 'block_size': 128, 'dropout': 0.0,
             'bias': False, 'vocab_size': 257, 'tokenizer': 'byte257(0..255 + eot=256)'},
    'hyperparams': {'updates': 2000, 'tokens_per_iter': 2048, 'batch_size': 16,
                    'grad_accum': 1, 'optimizer': 'AdamW(0.9,0.95)', 'lr': 6e-4,
                    'warmup_iters': 100, 'lr_decay_iters': 2000, 'min_lr': 6e-5,
                    'weight_decay': 0.1, 'grad_clip': 1.0, 'dtype': 'float32',
                    'compile': False, 'device': 'mps'},
    'seeds': [1337, 2024, 4242],
    'data_anonymous_counts': {
        'agentic_topics': corpus['topics']['n_used'],
        'split_topics': {s: corpus['splits'][s]['n_topics'] for s in ('train', 'val', 'test')},
        'split_method': corpus['splits']['method'],
        'redaction_counts': corpus['redaction'],
        'dedup': corpus['dedup'],
        'arm_tokens': {a: {s: corpus['arms'][a][s]['tokens'] for s in ('train', 'val', 'test')}
                       for a in corpus['arms']},
        'epoch_equivalent': {a: corpus['arms'][a]['epoch_equivalent'] for a in corpus['arms']},
        'public_source_sha256': corpus['public']['sha256'],
        'language_confound': corpus['public']['language_note'],
    },
    'runs': runs,
    'resume_proof': {
        'arm': results['resume']['arm'], 'seed': results['resume']['seed'],
        'segment_a_ckpt_iter': results['resume']['segment_a']['ckpt_iter_num'],
        'segment_b_first_iter': results['resume']['segment_b']['first_iter'],
        'segment_b_additional_updates': results['resume']['segment_b']['additional_updates'],
        'final_iter_num': results['resume']['segment_b']['final_iter_num'],
        'lr_schedule': results['resume']['lr_schedule'],
        'bitwise_note': results['resume']['bitwise_note'],
        'ckpt_final_sha256': results['resume']['ckpt_final_sha256'],
    },
    'samples': results['samples'],
    'eval': {
        'method': results['eval']['method'],
        'primary_metric': 'bits_per_byte_excl_eot(分子分母均排除 eot 目标)',
        'matrix': eval_matrix,
        'summary_bpb_excl_eot': results['eval']['summary_bpb_excl_eot'],
    },
    'command_templates': {
        'train': 'python3 train.py --dataset=<bin_dir> --out_dir=<run_dir> --seed=<seed> '
                 '--device=mps --dtype=float32 --compile=False --n_layer=4 --n_head=4 '
                 '--n_embd=128 --block_size=128 --batch_size=16 --gradient_accumulation_steps=1 '
                 '--dropout=0.0 --bias=False --learning_rate=6e-4 --max_iters=1999 '
                 '--lr_decay_iters=2000 --warmup_iters=100 --min_lr=6e-5 --weight_decay=0.1 '
                 '--beta1=0.9 --beta2=0.95 --grad_clip=1.0 --eval_interval=500 --eval_iters=100 '
                 '--log_interval=1',
        'resume_b': '同上 + --init_from=resume(加载 model+optimizer+iter_num)',
        'sample': 'python3 sample.py --out_dir=<run_dir> --ckpt_name=ckpt_final.pt --device=mps '
                  '--dtype=float32 --num_samples=4 --max_new_tokens=400 --seed=1337',
        'eval': 'python3 eval_loss.py --ckpt <ckpt_final.pt> --bin <test.bin> --device=mps',
    },
    'phase_proofs': {k: v.get('status') for k, v in progress['phases'].items()},
    'claims_boundary': '仅 next-byte 预测误差差异;结构消融受结构 token 目标与内容曝光差别限制;'
                       'n=3 seed,不做强显著性断言;不声称 agent 任务能力提升或纯因果收益',
}

PUB.mkdir(exist_ok=True)
(PUB / 'results.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
print(f"public/results.json 写出:{len(runs)} runs,opaque id 映射 {opaque}")
