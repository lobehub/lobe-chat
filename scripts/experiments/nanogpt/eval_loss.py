#!/usr/bin/env python3
"""独立 held-out 评估:加载任一 ckpt,在任一 .bin 上计算确定性窗口 NLL。

与训练日志无关:独立进程、独立脚本、固定窗口(协议冻结):
- 窗口:从 offset 0 开始,stride=block_size 的非重叠窗口;x=data[i:i+B], y=data[i+1:i+B+1];
- 指标:
  - nll_per_token          = 总 NLL / 目标 token 数(含 eot 目标)
  - bits_per_token_incl_eot= nll_per_token / ln2
  - bits_per_byte_excl_eot = 字节目标 NLL / ln2 / 目标中字节 token(y != 256)数  ← 公开主指标
输出仅 JSON 统计。
"""
import argparse
from contextlib import redirect_stdout
import hashlib
import json
import math
import sys
from pathlib import Path

import numpy as np
import torch

UPSTREAM = Path(__file__).resolve().parents[3] / '.records' / 'nanogpt' / 'upstream'
sys.path.insert(0, str(UPSTREAM))
from model import GPT, GPTConfig  # noqa: E402

EOT = 256


def sha256_file(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ckpt', required=True)
    ap.add_argument('--bin', required=True)
    ap.add_argument('--device', default='mps')
    ap.add_argument('--batch', type=int, default=64)
    args = ap.parse_args()

    ckpt = torch.load(args.ckpt, map_location=args.device, weights_only=False)
    conf = GPTConfig(**ckpt['model_args'])
    with redirect_stdout(sys.stderr):
        model = GPT(conf)
    sd = ckpt['model']
    for k in list(sd):
        if k.startswith('_orig_mod.'):
            sd[k[len('_orig_mod.'):]] = sd.pop(k)
    model.load_state_dict(sd)
    model.eval().to(args.device)
    B = conf.block_size

    data = np.memmap(args.bin, dtype=np.uint16, mode='r').astype(np.int64)
    starts = list(range(0, len(data) - B, B))
    assert starts, f'{args.bin} 太短,无法评估'

    nll_sum = 0.0
    byte_nll_sum = 0.0
    n_tokens = 0
    n_byte_targets = 0
    with torch.no_grad():
        for i in range(0, len(starts), args.batch):
            chunk = starts[i:i + args.batch]
            x = torch.stack([torch.from_numpy(data[s:s + B]) for s in chunk]).to(args.device)
            y = torch.stack([torch.from_numpy(data[s + 1:s + B + 1]) for s in chunk]).to(args.device)
            logits, _ = model(x, y)
            loss = torch.nn.functional.cross_entropy(
                logits.view(-1, logits.size(-1)).float(), y.reshape(-1), reduction='none')
            nll_sum += loss.sum().item()
            byte_nll_sum += loss[y.reshape(-1) != EOT].sum().item()
            n_tokens += y.numel()
            n_byte_targets += int((y != EOT).sum().item())

    out = {
        'ckpt': Path(args.ckpt).name,
        'ckpt_sha256': sha256_file(args.ckpt),
        'bin': Path(args.bin).name,
        'bin_sha256': sha256_file(args.bin),
        'ckpt_iter_num': ckpt.get('iter_num'),
        'block_size': B,
        'window_method': 'non-overlapping, offset 0, stride=block_size, x/y shifted by 1',
        'n_windows': len(starts),
        'n_target_tokens': n_tokens,
        'n_byte_targets_excl_eot': n_byte_targets,
        'nll_total': nll_sum,
        'nll_byte_targets': byte_nll_sum,
        'nll_per_token': nll_sum / n_tokens,
        'bits_per_token_incl_eot': nll_sum / n_tokens / math.log(2),
        'bits_per_byte_excl_eot': byte_nll_sum / math.log(2) / n_byte_targets,
    }
    print(json.dumps(out))


if __name__ == '__main__':
    main()
