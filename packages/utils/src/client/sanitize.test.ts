/**
 * @vitest-environment jsdom
 * DOMPurify's SVG filtering is unreliable under the package's default happy-dom: attribute hooks
 * never run and disallowed SVG tags survive, so assertions here would pass whatever the config.
 */
import { describe, expect, it } from 'vitest';

import { sanitizeSVGContent } from './sanitize';

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
        <rect width="10" height="10" onMouseOver='alert("hover")' onfocus=alert(1) />
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).not.toContain('onMouseOver');
    expect(sanitized).not.toContain('onfocus');
    expect(sanitized).toContain('<circle');
    expect(sanitized).toContain('fill="red"');
  });

  it('should not leave a recombined event handler after stripping', () => {
    // Removing the inner handler in a single pass would splice ` on` + `click="y"` back into a
    // fresh ` onclick="y"`; the scrub must repeat until no handler remains.
    const malicious = `<svg xmlns="http://www.w3.org/2000/svg"><circle on onclick="x"click="y" /></svg>`;

    const sanitized = sanitizeSVGContent(malicious);

    expect(sanitized).not.toMatch(/\son[a-z]+\s*=/i);
  });

  it('should remove dangerous embed and object tags', () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" fill="red" />
        <object data="malicious.swf"></object>
        <embed src="malicious.swf"></embed>
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    // The circle comes first: per the HTML parsing spec `<embed>` breaks out of SVG content, so
    // any SVG element after it is parsed as HTML and removed, in browsers as well as jsdom.
    expect(sanitized).not.toContain('<object');
    expect(sanitized).not.toContain('<embed');
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

    // Should preserve safe structure (assert by property, not exact serialization —
    // whitespace/self-closing handling varies across DOM engines).
    expect(sanitized).toContain('<svg');
    expect(sanitized).toContain('viewBox="0 0 200 200"');
    expect(sanitized).toContain('<linearGradient id="grad1"');
    expect(sanitized).toContain('stop-color="red"');
    expect(sanitized).toContain('transform="translate(50,50)"');

    // Should strip all threats regardless of engine
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('malicious');
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).not.toContain('onload');
    expect(sanitized).not.toContain('hack()');
    expect(sanitized).not.toContain('evil()');
  });

  it('should preserve SMIL animations and same-document <use> references', () => {
    const animatedSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100">
        <defs><circle id="dot" r="5" /></defs>
        <use href="#dot" x="10" y="10" />
        <use xlink:href="#dot" x="20" y="20" />
        <circle r="4">
          <animate attributeName="r" values="4;6;4" calcMode="linear" dur="1s" repeatCount="indefinite" />
        </circle>
        <g>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-100 0" dur="2s" />
        </g>
      </svg>
    `;

    const sanitized = sanitizeSVGContent(animatedSvg);

    expect(sanitized).toContain('<use href="#dot"');
    expect(sanitized).toContain('xlink:href="#dot"');
    expect(sanitized).toContain('<animate attributeName="r" values="4;6;4" calcMode="linear"');
    expect(sanitized).toContain('from="0 0"');
    expect(sanitized).toContain('to="-100 0"');
  });

  it('should neutralize animations that rewrite href or event handlers', () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <a href="#safe">
          <text>click</text>
          <animate attributeName="href" values="javascript:alert(1)" />
          <animate attributeName="xlink:href" to="javascript:alert(2)" />
          <animate attributeName=" ONCLICK " to="alert(3)" />
        </a>
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    expect(sanitized).toContain('<animate');
    expect(sanitized).not.toMatch(/attributeName/i);
  });

  it('should drop <use> references to external or data documents', () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <use href="https://evil.example/x.svg#a" />
        <use xlink:href="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=#a" />
      </svg>
    `;

    const sanitized = sanitizeSVGContent(maliciousSvg);

    expect(sanitized).toContain('<use');
    expect(sanitized).not.toContain('evil.example');
    expect(sanitized).not.toContain('data:');
  });
});
