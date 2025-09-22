export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.ENABLE_TELEMETRY) {
    await import('./instrumentation.node');
  }
}
