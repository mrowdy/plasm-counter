import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  incrementCounter,
  CounterBoundaryError,
  MaxRetryExceededError,
} from '../db/client';

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
  console.log('POST /increment request:', {
    requestId: event.requestContext?.requestId || 'direct-invocation',
    sourceIp: event.requestContext?.identity?.sourceIp || 'unknown',
  });

  try {
    const updatedCounter = await incrementCounter();
    const timestamp = new Date().toISOString();

    const response: CounterResponse = {
      value: updatedCounter.value,
      timestamp,
    };

    console.log('Counter incremented:', {
      value: updatedCounter.value,
      version: updatedCounter.version,
      timestamp,
    });

    return createResponse(200, response);
  } catch (error) {
    console.error('Error incrementing counter:', error);

    if (error instanceof CounterBoundaryError) {
      return createResponse(400, {
        error: 'BoundaryViolation',
        message: 'Cannot increment counter: already at maximum value (1,000,000,000)',
      });
    }

    if (error instanceof MaxRetryExceededError) {
      return createResponse(409, {
        error: 'ConcurrentUpdateConflict',
        message: 'Counter update failed due to concurrent modifications. Please retry.',
      });
    }

    if (error instanceof Error) {
      if (error.message.includes('Counter item not found')) {
        return createResponse(404, {
          error: 'NotFound',
          message: 'Counter not found in database. Please initialize the counter.',
        });
      }

      return createResponse(500, {
        error: 'InternalServerError',
        message: error.message || 'Failed to increment counter value',
      });
    }

    return createResponse(500, {
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  }
}
