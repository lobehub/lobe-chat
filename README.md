# Acceptance video layout evidence

These images are real browser captures of the repository's `VideoEvidencePlayer` and its actual UI dependencies rendered in an isolated local fixture. They are not screenshots of a deployed LobeHub report and are not a published acceptance run. The video is a generated test pattern; fixture captions contain no account or project data.

## Caption width

- PR: https://github.com/lobehub/lobehub/pull/20996
- Patched source: `bb344e392becad84d3075f5f1489d7fc8b6bbd88`
- Before source: `e76d208a62b5feac5b0fd7ec44edb6d52845c5be`
- Browser: cloud Chromium, captured through the supported cloud browser API on 2026-10-15.
- Desktop content width: 800px. Portrait video remains 203 × 360.3125px. Description changes from 203px to an 800px block.
- Landscape video remains 640 × 360px with an 800px description block.
- `after-portrait-390.png` uses a real 390px iframe viewport, not device emulation. Its 358px content and description widths match; the portrait video remains 203px wide.
- `narrow-results.json` records eight real-DOM measurements covering 320px and 390px iframe viewports, portrait and landscape clips, and ordinary text and long unbroken references. Description blocks match content width; no iframe document overflows horizontally.

The portrait control-bar clipping visible in the caption-only images is a separate issue handled by the controls PR, not part of the caption change.

## Portrait controls

- Patched source: `f91308c7c70b0d44712e4e5194c95635edaa2e44` (`fix/acceptance-video-controls-width`).
- Before source: `e76d208a62b5feac5b0fd7ec44edb6d52845c5be`.
- Browser: cloud Chromium, captured through the supported cloud browser API on 2026-10-15.
- These captures use the actual repository component, a generated five-minute video, and synthetic descriptions/chapter labels. They are local component fixtures, not deployed-report screenshots.
- `controls/after-portrait-desktop.jpg` shows the widened 480px player while its portrait picture remains 203px wide and centered.
- `controls/after-portrait-375.jpg` and `controls/after-portrait-320.jpg` use real embedded browser viewports at the named widths, not device emulation.
- `controls/layout-results.json` records six baseline and six patched cases: portrait at desktop/375px/320px/240px and landscape at desktop/375px. All patched control buttons remain inside the player, and documents have no horizontal overflow.
- The caption-only and controls-only fixes are rendered separately. Combining them requires the small overlapping player-width hunk to be rebased as described in the PRs.
