import { Span, SpanOptions, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import {
  SEMRESATTRS_CLOUD_PROVIDER,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

import { APP_NAME } from './constants';
import env from './env';

const traceName = 'app';

const createSDK = () => {
  const standardAttributes = {
    [SEMRESATTRS_SERVICE_NAME]: APP_NAME,
    [SEMRESATTRS_SERVICE_VERSION]: env.VERSION,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: env.ENVIRONMENT,
    ...(env.ENVIRONMENT !== 'local'
      ? { [SEMRESATTRS_CLOUD_PROVIDER]: 'cloudflare' }
      : {}),
  };

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: 'https://otlp.nr-data.net/v1/traces',
      headers: {
        'api-key': env.NEW_RELIC_LICENSE_KEY,
      },
    }),
    resource: new Resource(standardAttributes),
    spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
  });

  sdk.start();
};

export const startActiveSpan = <F extends (span: Span) => unknown>(
  name: string,
  callback: F,
  spanOptions: SpanOptions = {}
): ReturnType<F> => {
  const tracer = trace.getTracer(traceName);

  return tracer.startActiveSpan(name, spanOptions, callback);
};

/** Telemetry is started as a shared background service, needs to be started when spans are created */
createSDK();
