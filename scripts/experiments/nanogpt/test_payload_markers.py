import unittest

from build_corpus import assert_arm_invariant, render_full, render_norole, strip_generated_markers


class PayloadMarkerTest(unittest.TestCase):
    def test_literal_future_role_marker_in_payload_is_preserved(self):
        segments = [('header', '<|user|>'), ('body', 'Example:\n<|assistant|>\n正文'),
                    ('header', '<|assistant|>'), ('body', 'actual reply')]
        self.assertEqual(strip_generated_markers(render_full(segments), segments),
                         'Example:\n<|assistant|>\n正文\nactual reply\n')
        assert_arm_invariant(segments)

    def test_literal_tool_marker_in_payload_is_preserved(self):
        segments = [('header', '<|assistant|>'), ('body', '<|tool-call:Bash|>\nexample'),
                    ('toolmark', '<|tool-call:Bash|>')]
        self.assertEqual(strip_generated_markers(render_full(segments), segments),
                         render_norole(segments))
        assert_arm_invariant(segments)


if __name__ == '__main__':
    unittest.main()
