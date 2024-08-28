import type { ResolveConfigFn } from '@microlabs/otel-cf-workers';
import { Span, SpanOptions, trace } from '@opentelemetry/api';

import { APP_NAME } from './constants';
import { getEnvironmentVariables } from './env';

const SEMRESATTRS_DEPLOYMENT_ENVIRONMENT = 'deployment.environment';
const traceName = 'app';

export const startActiveSpan = <F extends (span: Span) => unknown>(
  name: string,
  callback: F,
  spanOptions: SpanOptions = {}
): ReturnType<F> => {
  const tracer = trace.getTracer(traceName);

  return tracer.startActiveSpan(name, spanOptions, callback);
};

export const telemetryConfig: ResolveConfigFn = () => {
  const env = getEnvironmentVariables();

  return {
    exporter: {
      url: 'https://otlp.nr-data.net/v1/traces',
      headers: { 'api-key': env.NEW_RELIC_LICENSE_KEY },
    },
    service: { name: APP_NAME, version: env.VERSION },
    postProcessor: (spans) => {
      if (spans.length === 0) return spans;

      // library doesn't support setting default attributes
      // https://github.com/evanderkoogh/otel-cf-workers/pull/127
      spans[0].resource.attributes[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT] =
        env.ENVIRONMENT;

      return spans;
    },
  };
};
