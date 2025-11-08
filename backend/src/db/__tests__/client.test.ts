import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  getCounter,
  updateCounter,
  incrementCounter,
  decrementCounter,
  CounterBoundaryError,
  MaxRetryExceededError,
} from '../client';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('DB Client', () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.clearAllMocks();
  });

  describe('getCounter', () => {
    it('should return counter from DynamoDB', async () => {
      const mockCounter = {
        id: 'global',
        value: 42,
        version: 5,
      };

      ddbMock.on(GetCommand).resolves({
        Item: mockCounter,
      });

      const result = await getCounter();

      expect(result).toEqual(mockCounter);
    });

    it('should throw error when counter not found', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: undefined,
      });

      await expect(getCounter()).rejects.toThrow('Counter item not found in database');
    });
  });

  describe('updateCounter', () => {
    it('should successfully increment counter', async () => {
      const currentCounter = {
        id: 'global',
        value: 10,
        version: 1,
      };

      const updatedCounter = {
        id: 'global',
        value: 11,
        version: 2,
      };

      ddbMock
        .on(GetCommand)
        .resolves({ Item: currentCounter })
        .on(UpdateCommand)
        .resolves({ Attributes: updatedCounter });

      const result = await updateCounter(1);

      expect(result.value).toBe(11);
      expect(result.version).toBe(2);
    });

    it('should use conditional expression for optimistic locking', async () => {
      const currentCounter = {
        id: 'global',
        value: 10,
        version: 5,
      };

      ddbMock
        .on(GetCommand)
        .resolves({ Item: currentCounter })
        .on(UpdateCommand)
        .resolves({
          Attributes: { ...currentCounter, value: 11, version: 6 },
        });

      await updateCounter(1);

      const updateCall = ddbMock.call(1);
      expect(updateCall.args[0].input).toMatchObject({
        ConditionExpression: '#version = :currentVersion',
        ExpressionAttributeValues: {
          ':currentVersion': 5,
          ':newVersion': 6,
        },
      });
    });
  });

  describe('Boundary Validation', () => {
    it('should throw error when incrementing beyond MAX_COUNTER_VALUE', async () => {
      const currentCounter = {
        id: 'global',
        value: 1000000000,
        version: 1,
      };

      ddbMock.on(GetCommand).resolves({ Item: currentCounter });

      await expect(updateCounter(1)).rejects.toThrow(CounterBoundaryError);
    });

    it('should throw error when decrementing below MIN_COUNTER_VALUE', async () => {
      const currentCounter = {
        id: 'global',
        value: 0,
        version: 1,
      };

      ddbMock.on(GetCommand).resolves({ Item: currentCounter });

      await expect(updateCounter(-1)).rejects.toThrow(CounterBoundaryError);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on ConditionalCheckFailedException and succeed', async () => {
      const firstRead = { id: 'global', value: 10, version: 1 };
      const secondRead = { id: 'global', value: 11, version: 2 };
      const finalUpdate = { id: 'global', value: 12, version: 3 };

      ddbMock
        .on(GetCommand)
        .resolvesOnce({ Item: firstRead })
        .resolvesOnce({ Item: secondRead })
        .on(UpdateCommand)
        .rejectsOnce(
          new ConditionalCheckFailedException({
            message: 'Condition check failed',
            $metadata: {},
          })
        )
        .resolvesOnce({ Attributes: finalUpdate });

      const result = await updateCounter(1);

      expect(result.value).toBe(12);
      expect(ddbMock.calls().length).toBe(4);
    });

    it('should throw MaxRetryExceededError after max retries', async () => {
      const currentCounter = { id: 'global', value: 10, version: 1 };

      ddbMock
        .on(GetCommand)
        .resolves({ Item: currentCounter })
        .on(UpdateCommand)
        .rejects(
          new ConditionalCheckFailedException({
            message: 'Condition check failed',
            $metadata: {},
          })
        );

      await expect(updateCounter(1)).rejects.toThrow(MaxRetryExceededError);
    });

    it('should not retry on CounterBoundaryError', async () => {
      const currentCounter = {
        id: 'global',
        value: 1000000000,
        version: 1,
      };

      ddbMock.on(GetCommand).resolves({ Item: currentCounter });

      await expect(updateCounter(1)).rejects.toThrow(CounterBoundaryError);
      expect(ddbMock.calls().length).toBe(1);
    });
  });

  describe('incrementCounter', () => {
    it('should increment by 1', async () => {
      const currentCounter = {
        id: 'global',
        value: 10,
        version: 1,
      };

      const updatedCounter = {
        id: 'global',
        value: 11,
        version: 2,
      };

      ddbMock
        .on(GetCommand)
        .resolves({ Item: currentCounter })
        .on(UpdateCommand)
        .resolves({ Attributes: updatedCounter });

      const result = await incrementCounter();

      expect(result.value).toBe(11);
    });
  });

  describe('decrementCounter', () => {
    it('should decrement by 1', async () => {
      const currentCounter = {
        id: 'global',
        value: 10,
        version: 1,
      };

      const updatedCounter = {
        id: 'global',
        value: 9,
        version: 2,
      };

      ddbMock
        .on(GetCommand)
        .resolves({ Item: currentCounter })
        .on(UpdateCommand)
        .resolves({ Attributes: updatedCounter });

      const result = await decrementCounter();

      expect(result.value).toBe(9);
    });
  });
});
