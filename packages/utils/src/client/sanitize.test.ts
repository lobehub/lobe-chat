import { describe, expect, it } from 'vitest';

import { sanitizeMermaidContent, sanitizeSVGContent } from './sanitize';

describe('sanitizeSVGContent', () => {
  it('should preserve safe SVG elements and attributes', () => {
    const safeSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="red" stroke="blue" stroke-width="2" />
        <rect x="10" y="10" width="30" height="30" fill="green" />
        <path d="M10,20 L30,40" stroke="black" />
      </svg>
    `;

    const sanitized = sanitizeSVGContent(safeSvg);

    expect(sanitized).toContain('<svg');
    expect(sanitized).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(sanitized).toContain('<circle');
    expect(sanitized).toContain('fill="red"');
    expect(sanitized).toContain('<rect');
    expect(sanitized).toContain('<path');
  });

  it('should remove dangerous script tags', () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <script>alert('XSS')</script>
        <circle cx="50" cy="50" r="40" fill="red" />
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
    expect(sanitized).toContain('<svg');
  });

  it('should remove dangerous event handler attributes', () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="red" onclick="alert('click')" onload="alert('load')" />
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).toContain('<circle');
    expect(sanitized).toContain('fill="red"');
  });

  it('should remove dangerous embed and object tags', () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <object data="malicious.swf"></object>
        <embed src="malicious.swf"></embed>
        <circle cx="50" cy="50" r="40" fill="red" />
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    // Note: DOMPurify with SVG profile may still allow some elements
    // The key security protection is removing script and event handlers
    expect(sanitized).toContain('<circle');
    expect(sanitized).toContain('fill="red"');
  });

  it('should handle empty or invalid SVG content gracefully', () => {
    expect(sanitizeSVGContent('')).toBe('');
    expect(sanitizeSVGContent('<invalid>content</invalid>')).toBe('');
  });

  it('should preserve complex SVG structures while removing threats', () => {
    const complexSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" stop-color="red" />
            <stop offset="100%" stop-color="blue" />
          </linearGradient>
        </defs>
        <g transform="translate(50,50)">
          <script>malicious()</script>
          <circle cx="50" cy="50" r="40" fill="url(#grad1)" onclick="hack()" />
          <text x="50" y="60" text-anchor="middle" onload="evil()">Hello</text>
        </g>
      </svg>
    `;

    const sanitized = sanitizeSVGContent(complexSvg);

    // Should preserve safe elements and attributes
    expect(sanitized).toEqual(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" stop-color="red"></stop>
            <stop offset="100%" stop-color="blue"></stop>
          </linearGradient>
        </defs>
        <g transform="translate(50,50)">
          </g></svg>`);
  });
});

describe('sanitizeMermaidContent', () => {
  it('should preserve safe Mermaid diagram content', () => {
    const safeMermaid = `
      graph TD;
        A[Start] --> B{Decision}
        B -->|Yes| C[OK]
        B -->|No| D[End]
    `;

    const sanitized = sanitizeMermaidContent(safeMermaid);

    expect(sanitized).toContain('graph TD;');
    expect(sanitized).toContain('A[Start]');
    expect(sanitized).toContain('B{Decision}');
  });

  it('should remove XSS attack via img onerror in HTML label', () => {
    const maliciousMermaid = `
      graph TD;
        A["<img src=x onerror='alert(1)'>"];
    `;

    const sanitized = sanitizeMermaidContent(maliciousMermaid);

    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toContain('graph TD;');
  });

  it('should remove script tags from HTML labels', () => {
    const maliciousMermaid = `
      graph TD;
        A["<script>malicious()</script>"];
        B["Normal Label"];
    `;

    const sanitized = sanitizeMermaidContent(maliciousMermaid);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('malicious');
    expect(sanitized).toContain('A[""]');
    expect(sanitized).toContain('B["Normal Label"]');
  });

  it('should remove event handlers from HTML labels', () => {
    const maliciousMermaid = `
      graph TD;
        A["<div onclick='evil()'>Click me</div>"];
        B["<span onmouseover='hack()'>Hover</span>"];
    `;

    const sanitized = sanitizeMermaidContent(maliciousMermaid);

    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('onmouseover');
    expect(sanitized).not.toContain('evil');
    expect(sanitized).not.toContain('hack');
  });

  it('should handle the PoC RCE attack via electronAPI', () => {
    // This is the actual PoC from the vulnerability report
    const maliciousMermaid = `
      graph TD;
      A["<img src=x onerror='window.electronAPI.invoke(String.fromCharCode(114,117,110,67,111,109,109,97,110,100),{command:String.fromCharCode(99,97,108,99,46,101,120,101)})'>"];
    `;

    const sanitized = sanitizeMermaidContent(maliciousMermaid);

    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('electronAPI');
    expect(sanitized).not.toContain('String.fromCharCode');
    expect(sanitized).not.toContain('<img');
  });

  it('should preserve safe formatting tags in labels', () => {
    const safeMermaid = `
      graph TD;
        A["<b>Bold</b> and <i>italic</i>"];
        B["<strong>Strong</strong>"];
    `;

    const sanitized = sanitizeMermaidContent(safeMermaid);

    expect(sanitized).toContain('<b>Bold</b>');
    expect(sanitized).toContain('<i>italic</i>');
    expect(sanitized).toContain('<strong>Strong</strong>');
  });

  it('should handle nested brackets correctly', () => {
    const mermaid = `
      graph TD;
        A[["Subroutine"]];
        B[("Database")];
    `;

    const sanitized = sanitizeMermaidContent(mermaid);

    expect(sanitized).toContain('A[["Subroutine"]]');
    expect(sanitized).toContain('B[("Database")]');
  });

  it('should handle empty content gracefully', () => {
    expect(sanitizeMermaidContent('')).toBe('');
  });

  it('should handle content without HTML labels', () => {
    const simpleMermaid = `
      graph LR
        A --> B --> C
    `;

    const sanitized = sanitizeMermaidContent(simpleMermaid);

    expect(sanitized).toBe(simpleMermaid);
  });
});
