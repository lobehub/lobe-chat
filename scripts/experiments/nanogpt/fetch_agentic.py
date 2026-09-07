#!/usr/bin/env python3
"""按 selection_rule.md 经 lh CLI 抓取 agentic topic 消息。

选择参数(agent/topic ID 等个人信息)从私有文件 .records/nanogpt/private/selection.json 读取;
公开示例见同目录 selection.example.json(占位符)。

安全约束:
- 只把 lh 的 JSON 输出原样写进 .records/nanogpt/private/,绝不把正文打印到 stdout/日志;
- stdout 只输出 topic/消息计数与文件 hash 等统计。
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PRIV = ROOT / '.records' / 'nanogpt' / 'private'
RAW = PRIV / 'raw'
SELECTION_PATH = PRIV / 'selection.json'


def lh(*args):
    r = subprocess.run(['lh', *args], capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        raise RuntimeError(f"lh {' '.join(args)} 失败: {r.stderr[:200]}")
    return r.stdout


def main():
    if not SELECTION_PATH.exists():
        raise SystemExit(
            f'缺少私有选择文件 {SELECTION_PATH};请参照 scripts/experiments/nanogpt/selection.example.json 创建')
    sel = json.loads(SELECTION_PATH.read_text(encoding='utf-8'))
    cutoff = sel['cutoff']
    agents = [(a['label'], a['agent_id']) for a in sel['agents']]
    exclude_ids = set(sel['exclude_topic_ids'])
    exclude_keywords = [k.lower() for k in sel['exclude_title_keywords']]
    per_agent = sel['per_agent_candidates']
    target_total = sel['target_total']
    max_msg = sel['max_messages_per_topic']
    page_size = sel['page_size']

    RAW.mkdir(parents=True, exist_ok=True)
    # 1) 候选 topic 列表(落盘,不打印 title)
    candidates = {}
    for label, agent_id in agents:
        out = lh('topic', 'list', '--agent-id', agent_id, '-L', str(per_agent),
                 '--json', 'id,title,createdAt,updatedAt')
        topics = json.loads(out)
        (PRIV / f'topics_{label}.json').write_text(out, encoding='utf-8')
        candidates[label] = topics

    # 2) 过滤 + 确定性选择
    selected = []
    leftover = []
    excluded_counts = {'id': 0, 'cutoff': 0, 'keyword': 0}
    for label, _ in agents:
        passed = []
        for t in candidates[label]:
            if t['id'] in exclude_ids:
                excluded_counts['id'] += 1
                continue
            if t['createdAt'] > cutoff:
                excluded_counts['cutoff'] += 1
                continue
            title = (t.get('title') or '').lower()
            if any(k in title for k in exclude_keywords):
                excluded_counts['keyword'] += 1
                continue
            passed.append(t['id'])
        selected += [(label, tid) for tid in passed[:10]]
        leftover += [(label, tid) for tid in passed[10:]]
    deficit = target_total - len(selected)
    if deficit > 0:
        selected += leftover[:deficit]
    selected = selected[:target_total]

    # 3) 抓消息:每 topic 至多 max_msg 条,--end 截止,原样落盘
    manifest = {'cutoff': cutoff, 'rule': 'selection_rule.md', 'topics': [],
                'excluded_counts': excluded_counts}
    for label, tid in selected:
        msgs = []
        page = 1
        while len(msgs) < max_msg:
            out = lh('message', 'list', '--topic-id', tid, '--end', cutoff,
                     '-L', str(page_size), '-P', str(page), '--json')
            batch = json.loads(out)
            if not batch:
                break
            msgs += batch
            if len(batch) < page_size:
                break
            page += 1
        msgs = msgs[:max_msg]
        blob = json.dumps(msgs, ensure_ascii=False).encode('utf-8')
        fp = RAW / f'{tid}.json'
        fp.write_bytes(blob)
        manifest['topics'].append({
            'agent': label,
            'topic_hash': hashlib.sha256(tid.encode()).hexdigest()[:16],
            'n_messages': len(msgs),
            'bytes': len(blob),
            'sha256': hashlib.sha256(blob).hexdigest(),
        })
        print(f'[fetch] agent={label} topic#{len(manifest["topics"])} msgs={len(msgs)} bytes={len(blob)}')

    (PRIV / 'fetch_manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
    total_msgs = sum(t['n_messages'] for t in manifest['topics'])
    total_bytes = sum(t['bytes'] for t in manifest['topics'])
    print(f'[fetch] done: topics={len(selected)} msgs={total_msgs} raw_bytes={total_bytes} excluded={excluded_counts}')


if __name__ == '__main__':
    sys.exit(main())
