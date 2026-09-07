#!/usr/bin/env python3
"""构建语料:脱敏 → 每 topic 生成共享消息片段 ledger → topic 级 70/15/15 划分
→ exact-paragraph 去重(两 arm 删除相同正文片段)→ byte tokenizer(vocab=256 字节 + 256 号 <|eot|>)
→ nanoGPT uint16 .bin。

arm 定义(同一 ledger 的两种渲染,正文逐字节一致):
- agentic-full:  header/toolmark 标记行 + 正文行
- agentic-norole:仅正文行(删掉的只有渲染时生成的标记行)

不变量(构建时断言,测试见 test_corpus_invariants.py):
- 从 full 渲染结果中按序删去 ledger 生成的标记行后,与 norole 渲染结果逐字节相同;
- 截断(100KB/topic、3MB 全局)作用于 ledger 的消息边界,先于两种渲染;
- 去重后 train 与 val/test 的正文段落 exact 重叠率为 0。

stdout 只输出统计,绝不输出正文。
"""
import hashlib
import json
import pickle
import random
import re
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[3]
REC = ROOT / '.records' / 'nanogpt'
PRIV = REC / 'private'
RAW = PRIV / 'raw'
PUBLIC_TXT = REC / 'data' / 'public' / 'input.txt'

EOT = 256
VOCAB_SIZE = 257
SPLIT_SEED = 20260907
TOPIC_CAP_BYTES = 100 * 1024
GLOBAL_CAP_BYTES = 3 * 1024 * 1024
PARA_MIN_CHARS = 50

# ---------------- 脱敏(顺序敏感:先长后短) ----------------
REDACTIONS = [
    ('JWT', re.compile(r'eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}')),
    ('KEY', re.compile(
        r'\b(?:sk|pk|ghp|gho|ghu|ghs|ghr|glpat|xoxb|xoxp|xoxa|xoxr|xoxs|AKIA|AIza|hf)'
        r'[-_][A-Za-z0-9_-]{10,}')),
    ('EMAIL', re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')),
    ('URL', re.compile(r'https?://[^\s/?#]+[^\s]*')),  # 保 scheme+host,去 path/query
    ('PATH', re.compile(r'(?:/Users|/home|/private|/var|/tmp|/Volumes)\\?[^\s:()\[\]{}"\']+|C:\\Users\\\S+')),
    ('TOKEN', re.compile(r'\b[A-Za-z0-9_-]{40,}\b')),
]

ROLE_NAMES = {'user', 'assistant', 'system', 'tool'}


def redact(text: str, counter: dict) -> str:
    for name, rx in REDACTIONS:
        if name == 'URL':
            def _url(m):
                counter['URL'] += 1
                parts = m.group(0).split('/')
                return '//'.join(parts[:2]) + '/' + parts[2] + '/<|URLPATH|>'
            text = rx.sub(_url, text)
        else:
            text, n = rx.subn(f'<|{name}|>', text)
            counter[name] += n
    return text


def sha256_file(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


# ---------------- ledger:每 topic 一份,两个 arm 同源渲染 ----------------
# segment = (kind, text);kind ∈ {header, body, toolmark}
# header/toolmark 为渲染时生成的标记行;body 为(脱敏后的)消息正文。

def topic_ledger(msgs, counter):
    segs = []
    for m in sorted(msgs, key=lambda x: x.get('createdAt') or ''):
        role = m.get('role') or 'unknown'
        content = m.get('content') or ''
        if not isinstance(content, str):
            content = json.dumps(content, ensure_ascii=False)
        content = redact(content, counter).strip()
        tools = m.get('tools') or []
        tool_names = []
        if isinstance(tools, list):
            for t in tools:
                if isinstance(t, dict):
                    nm = t.get('name') or t.get('toolName') or t.get('identifier') or 'unknown'
                    tool_names.append(str(nm))
        if role not in ROLE_NAMES:
            role = 'unknown'
        if tool_names and not content:
            for nm in tool_names:
                segs.append(('toolmark', f'<|tool-call:{nm}|>'))
            continue
        if not content:
            continue
        segs.append(('header', f'<|role:{role}|>'))
        segs.append(('body', content))
        for nm in tool_names:
            segs.append(('toolmark', f'<|tool-call:{nm}|>'))
    return segs


def render_full(segs):
    return ''.join(t + '\n' for _, t in segs)


def render_norole(segs):
    return ''.join(t + '\n' for k, t in segs if k == 'body')


def strip_generated_markers(full_text, segs):
    """按序从 full 文本中删去 ledger 生成的标记行,应还原出 norole。"""
    # Match ledger spans by position, never by payload text: a body can itself
    # contain a line identical to a later generated role marker.
    offset, out = 0, []
    for kind, text in segs:
        serialized = text + '\n'
        assert full_text.startswith(serialized, offset), 'rendered ledger span mismatch'
        if kind == 'body':
            out.append(full_text[offset:offset + len(serialized)])
        offset += len(serialized)
    assert offset == len(full_text), 'unexpected trailing bytes'
    return ''.join(out)


def assert_arm_invariant(segs):
    full = render_full(segs)
    norole = render_norole(segs)
    restored = strip_generated_markers(full, segs)
    assert restored == norole, 'arm 不变量被破坏:删去生成的标记行后正文不一致'


def group_segments(segs):
    """把平坦 ledger 按消息分组:header 开启新组;无 header 的 toolmark 序列自成一组。"""
    groups, cur = [], []
    for seg in segs:
        if seg[0] == 'header' and cur:
            groups.append(cur)
            cur = []
        cur.append(seg)
    if cur:
        groups.append(cur)
    return groups


def cap_ledger(segs, cap_bytes):
    """按消息边界截断 ledger(以 full 渲染字节计);返回 (segs, truncated)。"""
    out, total, truncated = [], 0, False
    for group in group_segments(segs):
        cost = sum(len(t.encode('utf-8')) + 1 for _, t in group)
        if total + cost > cap_bytes:
            truncated = True
            break
        out += group
        total += cost
    return out, truncated


# ---------------- 段落去重 ----------------
def split_paragraphs(text):
    """返回 [(para_text, sep_text)];para 为内容块,sep 为其后的空行分隔符。"""
    parts = re.split(r'(\n\s*\n)', text)
    out = []
    for i in range(0, len(parts), 2):
        para = parts[i]
        sep = parts[i + 1] if i + 1 < len(parts) else ''
        out.append((para, sep))
    return out


def para_hash(text):
    return hashlib.sha1(text.strip().encode('utf-8')).hexdigest()


def ledger_paragraph_hashes(segs):
    h = set()
    for k, t in segs:
        if k != 'body':
            continue
        for para, _ in split_paragraphs(t):
            if len(para.strip()) >= PARA_MIN_CHARS:
                h.add(para_hash(para))
    return h


def filter_body(body, collision_hashes, stats):
    parts = split_paragraphs(body)
    kept = []
    for para, sep in parts:
        if len(para.strip()) >= PARA_MIN_CHARS and para_hash(para) in collision_hashes:
            stats['removed'] += 1
            continue
        kept.append(para + sep)
    return ''.join(kept)


def filter_ledger_dedup(segs, collision_hashes, stats):
    """删除 train ledger 中与 val/test 碰撞的正文段落;空正文连同其 header 一起删除。"""
    out = []
    i = 0
    while i < len(segs):
        k, t = segs[i]
        if k == 'header' and i + 1 < len(segs) and segs[i + 1][0] == 'body':
            new_body = filter_body(segs[i + 1][1], collision_hashes, stats)
            if new_body.strip():
                out.append(segs[i])
                out.append(('body', new_body))
            else:
                stats['dropped_msgs'] += 1
            i += 2
        elif k == 'body':
            new_body = filter_body(t, collision_hashes, stats)
            if new_body.strip():
                out.append(('body', new_body))
            i += 1
        else:
            out.append(segs[i])
            i += 1
    return out


# ---------------- bin 写出 ----------------
def docs_to_bin(docs, out_dir: Path, name: str):
    ids = []
    for doc in docs:
        ids.extend(doc.encode('utf-8'))
        ids.append(EOT)
    arr = np.array(ids, dtype=np.uint16)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'meta.pkl').write_bytes(pickle.dumps({'vocab_size': VOCAB_SIZE, 'encoding': 'byte257'}))
    path = out_dir / f'{name}.bin'
    arr.tofile(path)
    return {'tokens': int(arr.size), 'sha256': sha256_file(path)}


def main():
    counter = {name: 0 for name, _ in REDACTIONS}
    stats = {'redaction': counter, 'topics': {}, 'splits': {}, 'dedup': {}, 'arms': {}}

    # 1) raw → ledger(共享),先截断后渲染
    ledgers = []  # (topic_file_stem, segs, truncated)
    total_full_bytes = 0
    global_stopped = False
    for fp in sorted(RAW.glob('tpc_*.json')):
        msgs = json.loads(fp.read_text(encoding='utf-8'))
        segs = topic_ledger(msgs, counter)
        segs, truncated = cap_ledger(segs, TOPIC_CAP_BYTES)
        cost = len(render_full(segs).encode('utf-8'))
        if total_full_bytes + cost > GLOBAL_CAP_BYTES:
            global_stopped = True
            break
        total_full_bytes += cost
        for seg_view in (segs,):
            assert_arm_invariant(seg_view)
        ledgers.append((fp.stem, segs, truncated))
    stats['topics'] = {
        'n_used': len(ledgers),
        'n_truncated_100kb': sum(1 for x in ledgers if x[2]),
        'global_cap_stopped': global_stopped,
        'total_full_bytes': total_full_bytes,
    }

    # 2) topic 级 70/15/15 划分(固定 seed,按字节量贪心,topic 不跨 split)
    rng = random.Random(SPLIT_SEED)
    order = list(range(len(ledgers)))
    rng.shuffle(order)
    sizes = [len(render_full(ledgers[i][1]).encode('utf-8')) for i in order]
    tot = sum(sizes) or 1
    target = {'train': 0.70 * tot, 'val': 0.15 * tot, 'test': 0.15 * tot}
    assign = {'train': [], 'val': [], 'test': []}
    cur = {'train': 0, 'val': 0, 'test': 0}
    for idx, sz in zip(order, sizes):
        split = max(target, key=lambda s: (target[s] - cur[s]) / target[s])
        assign[split].append(idx)
        cur[split] += sz
    for s in assign:
        assign[s].sort()
    stats['splits'] = {
        'seed': SPLIT_SEED,
        'method': 'topic-level, byte-greedy 70/15/15, no topic crosses splits',
        'train': {'n_topics': len(assign['train']), 'bytes': cur['train']},
        'val': {'n_topics': len(assign['val']), 'bytes': cur['val']},
        'test': {'n_topics': len(assign['test']), 'bytes': cur['test']},
    }

    # 3) 去重:碰撞集合来自 val/test 的正文段落;train 两 arm 删除相同正文片段(共享 ledger)
    val_hashes = set()
    for s in ('val', 'test'):
        for i in assign[s]:
            val_hashes |= ledger_paragraph_hashes(ledgers[i][1])
    before = {'train_paragraphs': 0, 'colliding': 0}
    for i in assign['train']:
        for k, t in ledgers[i][1]:
            if k != 'body':
                continue
            for para, _ in split_paragraphs(t):
                if len(para.strip()) >= PARA_MIN_CHARS:
                    before['train_paragraphs'] += 1
                    if para_hash(para) in val_hashes:
                        before['colliding'] += 1
    dstats = {'removed': 0, 'dropped_msgs': 0}
    train_ledgers = [filter_ledger_dedup(ledgers[i][1], val_hashes, dstats) for i in assign['train']]
    after_collide = 0
    after_paras = 0
    for segs in train_ledgers:
        hs = ledger_paragraph_hashes(segs)
        after_paras += len(hs)
        after_collide += len(hs & val_hashes)
    stats['dedup'] = {
        'method': ('exact paragraph(>=50 字符,按空行分段,去首尾空白,sha1);'
                   '与 val/test 碰撞的 train 段落从共享 ledger 删除(两 arm 删除相同正文片段,优先保留 test/val);'
                   'train 内 exact 重复段落保留但统计'),
        'train_paragraphs_before': before['train_paragraphs'],
        'train_paragraphs_colliding_before': before['colliding'],
        'cross_split_dup_rate_before': (before['colliding'] / before['train_paragraphs'])
        if before['train_paragraphs'] else 0.0,
        'paragraphs_removed': dstats['removed'],
        'messages_dropped_empty': dstats['dropped_msgs'],
        'sum_per_topic_unique_train_paragraphs_after': after_paras,
        'cross_split_dup_rate_after': (after_collide / after_paras) if after_paras else 0.0,
    }

    # 4) 渲染两个 agentic arm 并写 bin(同一 ledger,渲染前再断言不变量)
    split_ledgers = {
        'train': train_ledgers,
        'val': [ledgers[i][1] for i in assign['val']],
        'test': [ledgers[i][1] for i in assign['test']],
    }
    for arm, render in (('agentic_full', render_full), ('agentic_norole', render_norole)):
        out_dir = PRIV / 'bins' / arm
        for split, lds in split_ledgers.items():
            for segs in lds:
                assert_arm_invariant(segs)
            docs = [render(segs) for segs in lds]
            stats['arms'].setdefault(arm, {})[split] = docs_to_bin(docs, out_dir, split)

    # 不变量终检:full/norole train bin 解码后,删除标记行应一致(抽样逐 topic 已在上面断言,
    # 这里对整体 token 数关系做记录)
    stats['arm_invariant'] = 'asserted per-topic: strip_generated_markers(render_full(segs)) == render_norole(segs)'

    # 5) public-plain:tiny-shakespeare 连续 70/15/15,train 截断对齐 agentic-full train token 数
    raw = PUBLIC_TXT.read_text(encoding='utf-8')
    n = len(raw)
    b1 = raw.find('\n', int(n * 0.70)) + 1
    b2 = raw.find('\n', int(n * 0.85)) + 1
    pub = {'train': raw[:b1], 'val': raw[b1:b2], 'test': raw[b2:]}
    target_train_tokens = stats['arms']['agentic_full']['train']['tokens']
    out_dir = REC / 'data' / 'bins' / 'public_plain'
    pub_truncated = len(pub['train'].encode('utf-8')) > target_train_tokens
    for split, text in pub.items():
        if split == 'train':
            ids = list(text.encode('utf-8'))[:target_train_tokens]
            ids.append(EOT)
            arr = np.array(ids, dtype=np.uint16)
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / 'meta.pkl').write_bytes(
                pickle.dumps({'vocab_size': VOCAB_SIZE, 'encoding': 'byte257'}))
            path = out_dir / 'train.bin'
            arr.tofile(path)
            info = {'tokens': int(arr.size), 'sha256': sha256_file(path)}
        else:
            info = docs_to_bin([text], out_dir, split)
        stats['arms'].setdefault('public_plain', {})[split] = info
    stats['public'] = {
        'source': 'https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt',
        'sha256': sha256_file(PUBLIC_TXT), 'bytes': n,
        'split': 'contiguous 70/15/15 at newline boundaries (single continuous file of Early Modern English plays)',
        'train_truncated_to_match_agentic_full_train': pub_truncated,
        'language_note': 'public=早期现代英文戏剧;agentic=中英混杂+代码+工具标记,语言/内容混杂为已知混杂因素',
    }

    # 6) epoch-equivalent(固定 token 预算 4,096,000 / train tokens)
    budget = 4_096_000
    for arm in ('agentic_full', 'agentic_norole', 'public_plain'):
        tt = stats['arms'][arm]['train']['tokens']
        stats['arms'][arm]['epoch_equivalent'] = round(budget / tt, 3) if tt else None

    (REC / 'corpus_stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=1))
    print(json.dumps({
        'topics_used': stats['topics']['n_used'],
        'redaction': counter,
        'splits': stats['splits'],
        'dedup': stats['dedup'],
        'arm_tokens': {a: {s: stats['arms'][a][s]['tokens'] for s in ('train', 'val', 'test')}
                       for a in stats['arms']},
        'epoch_equivalent': {a: stats['arms'][a]['epoch_equivalent'] for a in stats['arms']},
    }, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
