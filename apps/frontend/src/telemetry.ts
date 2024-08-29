import { instrument } from '@microlabs/otel-cf-workers';
import { Span, SpanOptions, trace } from '@opentelemetry/api';

import { getEnvironmentVariables } from '@/env';

import { APP_NAME } from './constants';

const traceName = 'app';

export const startActiveSpan = <F extends (span: Span) => unknown>(
  name: string,
  callback: F,
  spanOptions: SpanOptions = {}
): ReturnType<F> => {
  const tracer = trace.getTracer(traceName);

  return tracer.startActiveSpan(name, spanOptions, callback);
};

export const startTelemetry = () => {
  const env = getEnvironmentVariables();

  instrument(
    {},
    {
      exporter: {
        url: 'https://otlp.nr-data.net/v1/traces',
        headers: {
          'api-key': env.NEW_RELIC_LICENSE_KEY,
        },
      },
      service: { name: APP_NAME },
    }
  );
};
