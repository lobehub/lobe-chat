#!/usr/bin/env python3
"""语料管道不变量的可执行测试(合成夹具,不读取任何真实数据)。

运行:python3 scripts/experiments/nanogpt/test_corpus_invariants.py
"""
import py_compile
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_corpus as bc  # noqa: E402

FAILURES = []


def check(name, cond, detail=''):
    if cond:
        print(f'  PASS {name}')
    else:
        FAILURES.append(name)
        print(f'  FAIL {name} {detail}')


def fake_msgs():
    return [
        {'role': 'user', 'content': '请修复登录页 bug,邮箱 alice@example.com 报错。',
         'createdAt': '2026-01-01T00:00:00Z', 'tools': None},
        {'role': 'assistant', 'content': '我先看 /Users/someone/project/login.tsx 文件。',
         'createdAt': '2026-01-01T00:00:01Z',
         'tools': [{'name': 'Read', 'arguments': {'file_path': '/Users/someone/secret'}}]},
        {'role': 'assistant', 'content': '', 'createdAt': '2026-01-01T00:00:02Z',
         'tools': [{'name': 'Bash', 'arguments': {'command': 'cat /Users/someone/.env'}}]},
        {'role': 'tool', 'content': 'token eyJhbGciOiJIUzI1NiIs.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c 已失效',
         'createdAt': '2026-01-01T00:00:03Z', 'tools': None},
        {'role': 'user', 'content': '参考 https://example.com/docs?token=abc123&x=1 与 sk-abcdefghijklmnopqrstuvwxyz',
         'createdAt': '2026-01-01T00:00:04Z', 'tools': None},
    ]


def test_arm_invariant():
    print('[test] arm 渲染不变量')
    counter = {n: 0 for n, _ in bc.REDACTIONS}
    segs = bc.topic_ledger(fake_msgs(), counter)
    full = bc.render_full(segs)
    norole = bc.render_norole(segs)
    restored = bc.strip_generated_markers(full, segs)
    check('strip(full)==norole', restored == norole)
    check('full 含角色标记', '<|role:user|>' in full and '<|role:assistant|>' in full)
    check('norole 不含生成的标记', '<|role:' not in norole and '<|tool-call:' not in norole)
    check('tool arguments 未导出', 'secret' not in full and '.env' not in full)
    check('纯工具调用消息保留工具名标记', '<|tool-call:Bash|>' in full)
    # 正文含类标记文本时:不全局剥除,正文保留原样
    tricky = [{'role': 'user', 'content': '文档里写着 <|role:user|> 这个标记的用法。\n\n第二段内容保持不变。',
               'createdAt': '2026-01-01T00:00:00Z', 'tools': None}]
    segs2 = bc.topic_ledger(tricky, counter)
    check('正文中的类标记文本不被误删',
          '文档里写着 <|role:user|> 这个标记的用法。' in bc.render_norole(segs2))


def test_cap_message_boundary():
    print('[test] ledger 截断(消息边界,两 arm 一致)')
    counter = {n: 0 for n, _ in bc.REDACTIONS}
    # 用中文正文,避免触发 TOKEN 脱敏正则(那会改变字节数、干扰截断断言)
    body_text = '正' * 300  # 900 字节 UTF-8
    msgs = [{'role': 'user', 'content': body_text, 'createdAt': f'2026-01-01T00:00:{i:02d}Z',
             'tools': None} for i in range(10)]
    segs = bc.topic_ledger(msgs, counter)
    capped, truncated = bc.cap_ledger(segs, 1000)
    check('发生截断', truncated)
    check('截断后不超过上限', len(bc.render_full(capped).encode()) <= 1000)
    check('截断后两 arm 不变量仍成立',
          bc.strip_generated_markers(bc.render_full(capped), capped) == bc.render_norole(capped))
    n_bodies = sum(1 for k, _ in capped if k == 'body')
    check('截断在消息边界(正文完整)', all(t == body_text for k, t in capped if k == 'body'),
          f'bodies={n_bodies}')


def test_dedup():
    print('[test] 跨 split exact-paragraph 去重')
    shared_para = '这是一段共享的模板文本,' * 10  # >=50 chars
    train_segs = [('header', '<|role:user|>'), ('body', shared_para + '\n\n训练独有内容aaa')]
    val_segs = [('header', '<|role:user|>'), ('body', '验证集内容\n\n' + shared_para)]
    collision = bc.ledger_paragraph_hashes(val_segs)
    stats = {'removed': 0, 'dropped_msgs': 0}
    filtered = bc.filter_ledger_dedup(train_segs, collision, stats)
    check('碰撞段落被删除', stats['removed'] == 1)
    after = bc.ledger_paragraph_hashes(filtered)
    check('去重后 train∩val 重叠为 0', len(after & collision) == 0)
    check('非碰撞段落保留', any('训练独有内容aaa' in t for k, t in filtered if k == 'body'))
    check('val/test 不被修改', bc.render_full(val_segs).count('共享的模板文本') == 10)
    # 整条消息正文都被删时,header 一并删除
    stats2 = {'removed': 0, 'dropped_msgs': 0}
    only_shared = [('header', '<|role:user|>'), ('body', shared_para)]
    filtered2 = bc.filter_ledger_dedup(only_shared, collision, stats2)
    check('空正文连同 header 删除', len(filtered2) == 0 and stats2['dropped_msgs'] == 1)


def test_redaction():
    print('[test] 脱敏')
    counter = {n: 0 for n, _ in bc.REDACTIONS}
    text = ('mail bob@corp.io; path /Users/alice/x.ts; jwt eyJhbGciOiJIUzI1NiIs.eyJzdWIiOiIxMjM0NTY3ODkwIn0'
            '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJVadQssw5c; key ghp_abcdefghijklmnop; '
            'url https://site.io/a/b?token=zz')
    out = bc.redact(text, counter)
    check('邮箱已替换', 'bob@corp.io' not in out and '<|EMAIL|>' in out)
    check('路径已替换', '/Users/alice' not in out and '<|PATH|>' in out)
    check('JWT 已替换', 'eyJhbGciOiJIUzI1NiIs' not in out)
    check('KEY 已替换', 'ghp_abcdefghijklmnop' not in out)
    check('URL 参数去除但保留 host', 'token=zz' not in out and 'site.io' in out)


def test_py_compile():
    print('[test] 全部脚本 py_compile')
    d = Path(__file__).resolve().parent
    for f in sorted(d.glob('*.py')):
        try:
            py_compile.compile(str(f), doraise=True)
            check(f'compile {f.name}', True)
        except py_compile.PyCompileError as e:
            check(f'compile {f.name}', False, str(e)[:120])


def main():
    test_arm_invariant()
    test_cap_message_boundary()
    test_dedup()
    test_redaction()
    test_py_compile()
    if FAILURES:
        print(f'\n{len(FAILURES)} 项失败: {FAILURES}')
        return 1
    print('\n全部不变量测试通过')
    return 0


if __name__ == '__main__':
    sys.exit(main())
