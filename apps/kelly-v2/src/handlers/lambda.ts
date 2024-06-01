import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { z } from 'zod';

import generateGif from '@/lib/generateGif';

// inputs
const schema = z.object({
  queryStringParameters: z.object({
    text: z.string().min(1),
  }),
});

const validateInput = (event: unknown): Parameters<typeof generateGif> => {
  const parsed = schema.parse(event);

  return [parsed.queryStringParameters.text];
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

    const result = await generateGif(...input);

    return getSuccessResponse(result);
  } catch (error) {
    console.error(error);

    return error instanceof z.ZodError ? redirectResponse : serverErrorResponse;
  }
};
