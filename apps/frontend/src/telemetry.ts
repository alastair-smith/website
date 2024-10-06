import { Span, SpanOptions, trace } from '@opentelemetry/api';
import { type ExportResult, ExportResultCode } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_VCS_REPOSITORY_REF_NAME,
} from '@opentelemetry/semantic-conventions/incubating';

import { getEnvironmentVariables } from '@/env';

import { APP_NAME } from './constants';

type Attributes = {
  key: string;
  value: Record<string, string>;
}[];

type ExportTraceServiceRequest = {
  resourceSpans: {
    resource: {
      attributes: Attributes;
    };
    scopeSpans: {
      scope: {
        name: string;
        version: string;
        attributes: Attributes;
      };
      spans: {
        traceId: string;
        spanId: string;
        parentSpanId: string | undefined;
        name: string;
        startTimeUnixNano: string;
        endTimeUnixNano: string;
        kind: number;
        attributes: Attributes;
      }[];
    }[];
  }[];
};

export class HTTPExporter implements SpanExporter {
  private url: string;
  private headers: Record<string, string>;

  constructor({
    url,
    headers,
  }: {
    url: string;
    headers: Record<string, string>;
  }) {
    this.url = url;
    this.headers = headers;
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    const payload = this.convertSpansToOtlpFormat(spans);

    fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          resultCallback({ code: ExportResultCode.SUCCESS });
        } else {
          console.error(
            'Failed to export spans, response status: ',
            response.status
          );
          resultCallback({ code: ExportResultCode.FAILED });
        }
      })
      .catch((error) => {
        console.error(
          'Failed to export spans, error: ',
          error instanceof Error ? error.message : error
        );
        resultCallback({ code: ExportResultCode.FAILED });
      });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  private convertSpansToOtlpFormat(
    spans: ReadableSpan[]
  ): ExportTraceServiceRequest {
    const resourceAttributes: Attributes = Object.entries(
      spans[0].resource.attributes
    ).map(([key, value]) => ({
      key,
      value: { stringValue: String(value) },
    }));

    // Convert each ReadableSpan to the OTLP span format
    const otlpSpans = spans
      // don't track calls to the telemetry endpoint
      // TODO swap to use span attribute http.url instead of name
      .filter(
        (span) =>
          span.name !== 'fetch POST https://otlp.eu01.nr-data.net/v1/traces'
      )
      .map((span) => {
        const spanAttributes: Attributes = Object.entries(span.attributes).map(
          ([key, value]) => ({
            key,
            value: { stringValue: String(value) },
          })
        );

        return {
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
          parentSpanId: span.parentSpanId || undefined,
          name: span.name,
          startTimeUnixNano: (
            span.startTime[0] * 1e9 +
            span.startTime[1]
          ).toString(),
          endTimeUnixNano: (span.endTime[0] * 1e9 + span.endTime[1]).toString(),
          kind: span.kind,
          attributes: spanAttributes,
        };
      });

    return {
      resourceSpans: [
        {
          resource: {
            attributes: resourceAttributes,
          },
          scopeSpans: [
            {
              scope: {
                name: 'default',
                version: '1.0.0',
                attributes: [],
              },
              spans: otlpSpans,
            },
          ],
        },
      ],
    };
  }
}

export const startActiveSpan = <F extends (span: Span) => unknown>(
  name: string,
  callback: F,
  spanOptions: SpanOptions = {}
): ReturnType<F> => {
  const tracer = trace.getTracer('default');

  return tracer.startActiveSpan(name, spanOptions, callback);
};

const startTelemetry = () => {
  const env = getEnvironmentVariables();

  const provider = new BasicTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: APP_NAME,
      [ATTR_SERVICE_VERSION]: env.VERSION,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.ENVIRONMENT,
      [ATTR_VCS_REPOSITORY_REF_NAME]: env.GIT_BRANCH_NAME,
    }),
  });

  const exporter = new HTTPExporter({
    url: 'https://otlp.eu01.nr-data.net/v1/traces',
    headers: { 'api-key': env.NEW_RELIC_LICENSE_KEY },
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  provider.register();
};

startTelemetry();
