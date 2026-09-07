#!/usr/bin/env bash
# 下载公共领域语料 tiny-shakespeare(karpathy/char-rnn 镜像,莎士比亚作品集,公共领域)
set -euo pipefail
cd "$(dirname "$0")/../../.."
mkdir -p .records/nanogpt/data/public
curl -fsSL "https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt" \
  -o .records/nanogpt/data/public/input.txt
shasum -a 256 .records/nanogpt/data/public/input.txt
wc -c .records/nanogpt/data/public/input.txt
