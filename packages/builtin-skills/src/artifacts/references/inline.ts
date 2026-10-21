const content = `# Inline HTML preview

Use an inline \`html\` block when the answer needs a custom visual that the \`visual\` and \`mermaid\` blocks cannot express: an interactive demo, an animation, a simulation, a parameter the reader can adjust. It is rendered inside the reply, next to the sentence it supports.

## When it fits

- Teaching a concept, showing how something behaves, illustrating a mechanism, comparing states.
- Any demo the reader looks at *while reading the answer*. Placing it next to the explanation is what makes the answer comfortable to read.
- A long answer may carry a few focused blocks, each right after the paragraph it illustrates, rather than one giant page.

If the visual is the thing the user came to build, or they want to keep, reopen, download or iterate on it, make an Artifact instead (see \`references/artifact\`). Never emit both an inline preview and a \`<lobeArtifact>\` for the same content.

## Mount contract

The chat only mounts a fenced \`html\` code block whose body is a **complete document**. Follow these rules exactly:

- **Open the document properly.** Begin with \`<!DOCTYPE html>\` and end with \`</html>\`. A fragment without \`<!DOCTYPE html>\` or \`<html\` renders as plain source code, so a sloppy wrapper throws the visual away.
- **One self-contained file.** All CSS and JS inside the document; CDN \`<script>\` and \`<link>\` tags are fine. No local assets, no build step, no external images that may 404.
- **Design for the message column, not a full screen.** The preview sizes itself to the content height and can be expanded into a drawer. Keep one focused visual: no page-level navigation, no marketing hero sections, no \`100vh\` layouts.
- **Blend into the answer.** Use \`background: transparent\`, \`color-scheme: light dark\` and the system font so the block matches the chat in both themes; do not repeat the surrounding heading as a title.
- **Sandbox limits.** Scripts, forms and modals run. Cookies, \`window.parent\`, popups and top-level navigation do not, and \`localStorage\` is a per-preview shim: nothing persists across messages.
- **Keep it lean.** Enough markup to show the idea; skip boilerplate the preview does not need. Long output costs the user reading time before they reach the visual.
- **Talk around it.** One or two sentences before the block setting up what to look at, optionally one line after it pointing out what to try. Do not narrate the code.
- **Facts stay exact.** Show numbers and claims exactly as stated in the sources you cite.

## Example

User: What is a Voronoi diagram? Show me.

Assistant:
A Voronoi diagram splits a plane into one region per site, where every point belongs to its nearest site. Drag the dots below and watch the borders re-cut themselves:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; }
    svg { display: block; width: 100%; height: 320px; }
    circle { fill: #7c5cff; cursor: grab; }
  </style>
</head>
<body>
  <svg id="canvas" viewBox="0 0 600 320">
    <circle cx="140" cy="120" r="9" />
    <circle cx="330" cy="90" r="9" />
    <circle cx="430" cy="230" r="9" />
  </svg>
  <script>
    // build the regions from the three sites, then let the reader drag them
  </script>
</body>
</html>
\`\`\`

Each region is the set of points closer to its own site than to any other, which is why dropping a new site always steals area from its neighbours.
`;

export default content;
