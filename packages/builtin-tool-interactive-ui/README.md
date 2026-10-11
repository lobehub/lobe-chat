# Interactive UI (experimental)

An opt-in `lobe-interactive-ui` builtin with one `renderUI` API. It adds an interactive answer artifact to the existing LobeHub tool-call/message pipeline. It does not replace the agent runtime, introduce CopilotKit/AG-UI, or call a separate visualization service.

## Try it

Enable **Interactive UI** for an agent through the existing tool picker, or ask an agent with tool discovery to activate `lobe-interactive-ui`. Use agent mode: this experiment is not added to the chat-mode allowlist or to every agent's defaults. Shared-agent visitors are not granted this tool by default.

Example prompt:

> Build an interactive plan comparison using illustrative monthly prices A = 0.12 × quantity, B = 20 + 0.06 × quantity, C = 50 + 0.03 × quantity. Use quantity 10–1000, initially 500. Show each cost and a comparison bar, let me choose a plan, and prepare a follow-up with the current choice. Use the Interactive UI tool.

`examples/plan-comparison.json` is a deterministic `renderUI` argument fixture. At 500 its costs are 60 / 50 / 65; at 1000 they are 120 / 80 / 80. It is suitable for injecting a controlled model response at the model boundary; it is not a separate demo product or proof of end-to-end acceptance.

## Contract and lifecycle

- Version 1: bounded `title`, `fallback`, `html`, `css`, and `js`; unknown fields/versions and oversized sources are rejected by both runtime and renderer. The total UTF-8 limit is 128 KB.
- Streaming arguments produce a sanitized, script-free HTML/CSS preview. Partial or repaired JSON is never executed.
- A successfully completed artifact starts an opaque-origin `srcdoc` iframe. Generated JavaScript executes only in a dedicated Worker; trusted frame code applies a finite set of scalar DOM updates.
- JavaScript can use `lobeUI.on`, `setText`, `setValue`, `setStyle`, and `propose`, as documented in `src/systemRole.ts`. Native `document`, `window`, arbitrary attributes, HTML replacement, imports and host APIs are unavailable. This is intentionally a smaller API than a general browser app; the HTML/CSS layout and computation remain generated.
- The source is stored in the existing persisted tool arguments. Result state contains only `{ status: 'ready', version: 1 }`. Reopening reconstructs the artifact, not arbitrary JavaScript state. Closing, restarting, refreshing, or virtualized unmounting resets controls and variables. No new database table or state-migration promise is introduced.
- `renderUI` segments remain outside both workflow and completed-process folds, including mixed tool batches and steered continuations. Normal process steps still fold. Stable keys preserve an already-mounted widget across completion/fold transitions.

## Follow-ups and permissions

`lobeUI.propose(text)` can only propose a bounded text message. The host displays it in an editable text area; generated code cannot send it. A trusted click on the host's **Send to this conversation** button is required. A pending proposal cannot be replaced by the widget while it is being reviewed.

The host rechecks the current writable composer, original conversation key, source tool message, and busy/read-only state at click time. The sandbox cannot choose an agent, topic, recipient, or tool. Sending uses the existing conversation action and server authorization, preserves any draft in the composer, and includes the source tool message in the resulting text. Double-clicks and repeated request IDs are suppressed for the mounted instance. An uncertain send is never automatically retried. This is not a new persistent cross-device idempotency protocol.

## Isolation boundary

- iframe sandbox permits scripts only: no same-origin, popups, forms, downloads, or parent navigation.
- Strict CSP blocks network/resource loads, nested frames, objects, base URLs, inline event handlers and eval. Only trusted nonce-bearing bootstrap code runs in the iframe. Generated code is serialized into a Blob Worker, never inserted into the iframe's script context.
- DOMPurify sanitizes inert template contents with a restrictive HTML/attribute allowlist. External resources, navigation, scripts, SVG/MathML namespaces, dangerous input types, and reserved host IDs are excluded. The original source never enters the host's live DOM.
- Generated code has no native Window, so it cannot use the iframe self-navigation gap that a plain `sandbox="allow-scripts"` iframe would leave open. Worker CSP inheritance and actual browser behavior still require real-browser verification for each supported runtime.
- Bridge handlers check exact source Window, opaque origin, per-mount token, message type/version, scalar limits, sequential request IDs and a finite proposal count. A valid message carries no user authorization.
- Worker traffic, DOM fan-out, listeners, source sizes and lifetime are bounded. A watchdog terminates an unresponsive Worker. Host-owned localized error/pause messages and restart controls stay outside generated styling.

This is defense in depth, not a claim that unit tests establish a security proof. Browsers still control process scheduling and memory; resource exhaustion, sanitizer/library bugs and browser bugs remain review concerns. Do not enter secrets or sensitive information. Arbitrary external resources, persistent state, canvas/SVG, cross-turn patching, tool access and navigation are out of scope.

## Inspiration and license

The artifact/streaming-preview approach was informed by [CopilotKit/OpenIntelligentUI](https://github.com/CopilotKit/OpenIntelligentUI) (reviewed at [`f6e4388b26a64b9a0714943b08a1ce622b924eec`](https://github.com/CopilotKit/OpenIntelligentUI/tree/f6e4388b26a64b9a0714943b08a1ce622b924eec), [MIT license](https://github.com/CopilotKit/OpenIntelligentUI/blob/f6e4388b26a64b9a0714943b08a1ce622b924eec/LICENSE)). This implementation is original; no upstream source was copied or vendored. Its renderer, CDN policy, follow-up bridge, CopilotKit/Python/AG-UI stack, and Jev routing are not imported.

## Verification

Programmatic checks and browser/full-stack acceptance are reported separately in the Draft PR. Sanitizer tests use jsdom rather than happy-dom. A standalone sandbox harness can establish browser behavior, but cannot establish tool discovery, agent execution, persisted history, the host send path, or completed-answer presentation in the running product. These require the delivered branch's actual full-stack chat surface. No production debug proxy counts as acceptance.
