import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { env } from 'node:process';

export function register(options?: { debug?: true | DiagLogLevel; version?: string }) {
  const attributes: Record<string, string> = {
    [ATTR_SERVICE_NAME]: 'lobe-chat',
  };
  if (typeof options?.version !== 'undefined') {
    attributes[ATTR_SERVICE_VERSION] = options.version;
  }
  if (typeof options?.debug !== 'undefined') {
    diag.setLogger(
      new DiagConsoleLogger(),
      options.debug === true ? DiagLogLevel.DEBUG : options.debug,
    );
  }

  let metricsExporterInterval = 1000;
  if (env.OTEL_METRICS_EXPORTER_INTERVAL) {
    const parsed = parseInt(env.OTEL_METRICS_EXPORTER_INTERVAL, 10);
    if (!isNaN(parsed)) {
      metricsExporterInterval = parsed;
    }
  }

  const sdk = new NodeSDK({
    instrumentations: [
      new PgInstrumentation(),
      new HttpInstrumentation(),
      getNodeAutoInstrumentations(),
    ],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exportIntervalMillis: metricsExporterInterval,
        exporter: new OTLPMetricExporter(),
      }),
    ],
    resource: resourceFromAttributes(attributes),
    traceExporter: new OTLPTraceExporter(),
  });

  sdk.start();
}

export { DiagLogLevel } from '@opentelemetry/api';
