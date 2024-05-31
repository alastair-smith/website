import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { z } from 'zod';

import generateGif from '@/lib/generateGif';

const schema = z.object({
  queryStringParameters: z.object({
    text: z.string().min(1),
  }),
});

const validateInput = (event: unknown): Parameters<typeof generateGif> => {
  const parsed = schema.parse(event);

  return [parsed.queryStringParameters.text];
};

export const handler: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  let input;
  try {
    input = validateInput(event);
  } catch (error) {
    return {
      statusCode: 302,
      headers: {
        Location: 'https://alsmith.dev/kelly',
      },
      isBase64Encoded: false,
      body: '',
    };
  }

  let result;
  try {
    result = await generateGif(...input);
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      isBase64Encoded: false,
      body: 'INTERNAL SERVER ERROR',
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/gif',
    },
    body: result,
    isBase64Encoded: true,
  };
};
