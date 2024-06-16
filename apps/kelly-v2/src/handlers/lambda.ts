import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { z } from 'zod';

import kelly from '@/lib/generateGif';
import potter from '@/lib/potter';

// inputs
const schema = z.object({
  queryStringParameters: z.object({
    q: z.string().min(1).describe('base64 text to generate gif from'),
    type: z.enum(['kelly', 'potter']).default('kelly'),
  }),
});

const validateInput = (event: unknown) => {
  const parsed = schema.parse(event);

  const base64Text = parsed.queryStringParameters.q;
  const text = Buffer.from(base64Text, 'base64').toString('utf-8');

  return {
    text,
    type: parsed.queryStringParameters.type,
  };
};

// outputs
const redirectResponse: APIGatewayProxyResult = {
  statusCode: 302,
  headers: {
    Location: 'https://alsmith.dev/kelly',
  },
  isBase64Encoded: false,
  body: '',
} as const;
const serverErrorResponse: APIGatewayProxyResult = {
  statusCode: 500,
  isBase64Encoded: false,
  body: 'INTERNAL SERVER ERROR',
} as const;
const getSuccessResponse = (body: string): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'image/gif',
  },
  body,
  isBase64Encoded: true,
});

export const handler: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    const input = validateInput(event);

    const result =
      input.type === 'kelly'
        ? await kelly(input.text)
        : await potter(input.text);

    return getSuccessResponse(result);
  } catch (error) {
    console.error(error);

    return error instanceof z.ZodError ? redirectResponse : serverErrorResponse;
  }
};
