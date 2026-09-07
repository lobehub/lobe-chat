# AUV builtin tool

Provides `lobe-auv/runCommand` for typed native computer commands on the active desktop device.

## Usage

Pass CLI arguments after the executable name, such as `{ "argv": ["invoke", "display.list"] }`.
The desktop service owns the AUV connection and executes the command over private IPC.
Use `invoke --help` to discover commands. Image artifact paths can be opened with Local System
`readFile`.

The package root exports the manifest and types. The `/client` entry exports the inspector;
`/client/executor` exports desktop execution wiring. The inspector uses the shared command header
and accepts both final and streaming arguments. The enclosing chat header handles execution status.

## When to use

Use AUV for native display, application, window, and input operations supported by the active device.
Preview command headers and lifecycle states in the Dev Dock's Render Gallery under AUV.

## When not to use

Use Local System for shell commands or file operations. AUV does not accept shell syntax and needs
a desktop client that supports its runtime.
