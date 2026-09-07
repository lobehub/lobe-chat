"""Synthetic regression: every position evaluated; EOT excluded from byte NLL."""
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import numpy as np
import torch

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / '.records/nanogpt/upstream'))
from model import GPT, GPTConfig


class EvalRegression(unittest.TestCase):
    def test_full_positions_and_byte_denominator(self):
        torch.manual_seed(73)
        model = GPT(GPTConfig(block_size=4, vocab_size=257, n_layer=1,
                              n_head=1, n_embd=8, dropout=0.0))
        model.eval()
        data = np.array([0, 1, 256, 3, 4, 5, 256, 7, 8, 9, 10, 11, 12], dtype=np.uint16)
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder)
            torch.save({'model': model.state_dict(), 'model_args': vars(model.config),
                        'iter_num': 0}, p / 'ckpt.pt')
            data.tofile(p / 'test.bin')
            result = subprocess.run([sys.executable, str(Path(__file__).with_name('eval_loss.py')),
                                     '--ckpt', str(p / 'ckpt.pt'), '--bin', str(p / 'test.bin'),
                                     '--device', 'cpu', '--batch', '2'],
                                    check=True, capture_output=True, text=True)
            actual = json.loads(result.stdout.strip().splitlines()[-1])
        starts = [0, 4, 8]
        x = torch.tensor(np.stack([data[s:s+4] for s in starts]).astype(np.int64))
        y = torch.tensor(np.stack([data[s+1:s+5] for s in starts]).astype(np.int64))
        with torch.no_grad():
            logits, _ = model(x, y)
            losses = torch.nn.functional.cross_entropy(logits.reshape(-1, 257), y.reshape(-1), reduction='none')
        mask = y.reshape(-1) != 256
        self.assertEqual(actual['n_target_tokens'], y.numel())
        self.assertEqual(actual['n_byte_targets_excl_eot'], int(mask.sum()))
        self.assertAlmostEqual(actual['nll_per_token'], float(losses.mean()), places=5)
        self.assertAlmostEqual(actual['bits_per_byte_excl_eot'], float(losses[mask].mean())/math.log(2), places=5)


if __name__ == '__main__':
    unittest.main()
