import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCounter } from '../db/client';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

interface CounterResponse {
  value: number;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

function createResponse(
  statusCode: number,
  body: CounterResponse | ErrorResponse
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('GET /count request:', {
    requestId: event.requestContext?.requestId || 'direct-invocation',
    sourceIp: event.requestContext?.identity?.sourceIp || 'unknown',
  });

  try {
    const counter = await getCounter();
    const timestamp = new Date().toISOString();

    const response: CounterResponse = {
      value: counter.value,
      timestamp,
    };

    console.log('Counter retrieved:', {
      value: counter.value,
      version: counter.version,
      timestamp,
    });

    return createResponse(200, response);
  } catch (error) {
    console.error('Error retrieving counter:', error);

    if (error instanceof Error) {
      if (error.message.includes('Counter item not found')) {
        return createResponse(404, {
          error: 'NotFound',
          message: 'Counter not found in database. Please initialize the counter.',
        });
      }

      return createResponse(500, {
        error: 'InternalServerError',
        message: error.message || 'Failed to retrieve counter value',
      });
    }

    return createResponse(500, {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  }
}
