import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

import { version } from '../package.json';

const sdk = new NodeSDK({
  instrumentations: [new PgInstrumentation(), new HttpInstrumentation()],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'lobe-chat',
    [ATTR_SERVICE_VERSION]: version,
  }),
  traceExporter: new OTLPTraceExporter(),
});

sdk.start();
