import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../increment';
import * as dbClient from '../../db/client';

jest.mock('../../db/client');

const mockIncrementCounter = dbClient.incrementCounter as jest.MockedFunction<
  typeof dbClient.incrementCounter
>;

describe('increment Handler', () => {
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

  it('should increment counter and return 200 status', async () => {
    const mockCounter = {
      id: 'global',
      value: 43,
      version: 6,
    };

    mockIncrementCounter.mockResolvedValue(mockCounter);

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toMatchObject({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    });

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('value', 43);
    expect(body).toHaveProperty('timestamp');
  });

  it('should return 400 on CounterBoundaryError', async () => {
    mockIncrementCounter.mockRejectedValue(
      new dbClient.CounterBoundaryError('Counter at maximum value')
    );

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('BoundaryViolation');
  });

  it('should return 409 on MaxRetryExceededError', async () => {
    mockIncrementCounter.mockRejectedValue(
      new dbClient.MaxRetryExceededError('Maximum retry attempts exceeded')
    );

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(409);

    const body = JSON.parse(result.body);
    expect(body.error).toBe('ConcurrentUpdateConflict');
  });

  it('should return 404 when counter not found', async () => {
    mockIncrementCounter.mockRejectedValue(
      new Error('Counter item not found in database')
    );

    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(404);
  });
});
