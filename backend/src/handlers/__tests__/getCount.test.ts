import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../getCount';
import * as dbClient from '../../db/client';

jest.mock('../../db/client');

const mockGetCounter = dbClient.getCounter as jest.MockedFunction<typeof dbClient.getCounter>;

describe('getCount Handler', () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    requestContext: {
      requestId: 'test-request-id',
      identity: {
        sourceIp: '127.0.0.1',
      },
    } as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return counter value with 200 status and CORS headers', async () => {
    const mockCounter = {
      id: 'global',
      value: 42,
      version: 5,
    };

    mockGetCounter.mockResolvedValue(mockCounter);

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toMatchObject({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('value', 42);
    expect(body).toHaveProperty('timestamp');
  });

  it('should return 404 when counter not found', async () => {
    mockGetCounter.mockRejectedValue(
      new Error('Counter item not found in database')
    );

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);

    const body = JSON.parse(result.body);
    expect(body).toEqual({
      error: 'NotFound',
      message: 'Counter not found in database. Please initialize the counter.',
    });
  });

  it('should return 500 on database error', async () => {
    mockGetCounter.mockRejectedValue(new Error('DynamoDB connection failed'));

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(500);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('InternalServerError');
  });
});
