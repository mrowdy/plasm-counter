import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  MIN_COUNTER_VALUE,
  MAX_COUNTER_VALUE,
  COUNTER_ITEM_ID,
  MAX_RETRY_ATTEMPTS,
} from '../index';

const TABLE_NAME = process.env.TABLE_NAME || 'counter-table';
const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';

const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});

export interface Counter {
  id: string;
  value: number;
  version: number;
}

export class CounterBoundaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CounterBoundaryError';
  }
}

export class MaxRetryExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MaxRetryExceededError';
  }
}

function validateCounterValue(value: number): void {
  if (value < MIN_COUNTER_VALUE || value > MAX_COUNTER_VALUE) {
    throw new CounterBoundaryError(
      `Counter value ${value} is out of valid range [${MIN_COUNTER_VALUE}, ${MAX_COUNTER_VALUE}]`
    );
  }
}

function calculateBackoff(attempt: number): number {
  const baseDelay = 50;
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCounter(): Promise<Counter> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id: COUNTER_ITEM_ID,
      },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      throw new Error('Counter item not found in database');
    }

    const counter: Counter = {
      id: response.Item.id as string,
      value: response.Item.value as number,
      version: response.Item.version as number,
    };

    return counter;
  } catch (error) {
    console.error('Error getting counter:', error);
    throw error;
  }
}

export async function updateCounter(delta: number): Promise<Counter> {
  let attempt = 0;

  while (attempt < MAX_RETRY_ATTEMPTS) {
    try {
      const currentCounter = await getCounter();
      const newValue = currentCounter.value + delta;
      validateCounterValue(newValue);

      const command = new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: COUNTER_ITEM_ID,
        },
        UpdateExpression: 'SET #value = :newValue, #version = :newVersion',
        ConditionExpression: '#version = :currentVersion',
        ExpressionAttributeNames: {
          '#value': 'value',
          '#version': 'version',
        },
        ExpressionAttributeValues: {
          ':newValue': newValue,
          ':newVersion': currentCounter.version + 1,
          ':currentVersion': currentCounter.version,
        },
        ReturnValues: 'ALL_NEW',
      });

      const response = await docClient.send(command);

      if (!response.Attributes) {
        throw new Error('Update operation did not return attributes');
      }

      const updatedCounter: Counter = {
        id: response.Attributes.id as string,
        value: response.Attributes.value as number,
        version: response.Attributes.version as number,
      };

      console.log(
        `Counter updated: ${currentCounter.value} -> ${updatedCounter.value} (attempt ${attempt + 1})`
      );

      return updatedCounter;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        attempt++;

        if (attempt >= MAX_RETRY_ATTEMPTS) {
          throw new MaxRetryExceededError(
            `Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) exceeded`
          );
        }

        const backoffMs = calculateBackoff(attempt - 1);
        console.warn(
          `Concurrent update detected, retry ${attempt}/${MAX_RETRY_ATTEMPTS} after ${backoffMs.toFixed(0)}ms`
        );
        await sleep(backoffMs);
        continue;
      }

      if (error instanceof CounterBoundaryError) {
        console.error('Counter boundary violation:', error.message);
        throw error;
      }

      console.error('Error updating counter:', error);
      throw error;
    }
  }

  throw new MaxRetryExceededError(
    `Maximum retry attempts (${MAX_RETRY_ATTEMPTS}) exceeded`
  );
}

export async function incrementCounter(): Promise<Counter> {
  return updateCounter(1);
}

export async function decrementCounter(): Promise<Counter> {
  return updateCounter(-1);
}

export { docClient };
