/**
 * Local Integration Test Utility
 *
 * This script tests all Lambda handlers against a real DynamoDB instance.
 * Use this for integration testing before deployment.
 *
 * Prerequisites:
 * - DynamoDB table must exist (created by Terraform)
 * - AWS credentials configured
 * - Environment variables set (TABLE_NAME, AWS_REGION)
 *
 * Usage:
 *   ts-node src/handlers/test-local.ts
 *   npm run build && node dist/handlers/test-local.js
 */

import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as getCountHandler } from './getCount';
import { handler as incrementHandler } from './increment';
import { handler as decrementHandler } from './decrement';

// Mock API Gateway event
function createMockEvent(): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/count',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test',
      protocol: 'HTTP/1.1',
      httpMethod: 'GET',
      path: '/count',
      stage: 'test',
      requestId: 'test-request-id',
      requestTimeEpoch: Date.now(),
      resourceId: 'test',
      resourcePath: '/count',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '127.0.0.1',
        user: null,
        userAgent: 'test-agent',
        userArn: null,
        vpcId: null,
        vpceId: null,
      },
      authorizer: null,
    },
    resource: '/count',
  };
}

async function runTests(): Promise<void> {
  console.log('=====================================');
  console.log('Local Integration Test');
  console.log('=====================================');
  console.log('');
  console.log('Configuration:');
  console.log(`  TABLE_NAME: ${process.env.TABLE_NAME || 'counter-table'}`);
  console.log(`  AWS_REGION: ${process.env.AWS_REGION || 'eu-central-1'}`);
  console.log('');

  try {
    // Test 1: Get initial counter value
    console.log('Test 1: GET /count - Get initial value');
    console.log('---------------------------------------');
    const getEvent = createMockEvent();
    const getResult1 = await getCountHandler(getEvent);
    console.log(`Status: ${getResult1.statusCode}`);
    console.log(`Response: ${getResult1.body}`);
    console.log('');

    if (getResult1.statusCode !== 200) {
      console.error('Failed to get counter. Exiting.');
      process.exit(1);
    }

    const initialValue = JSON.parse(getResult1.body).value;
    console.log(`Initial counter value: ${initialValue}`);
    console.log('');

    // Test 2: Increment counter
    console.log('Test 2: POST /increment - Increment counter');
    console.log('--------------------------------------------');
    const incrementEvent = createMockEvent();
    incrementEvent.httpMethod = 'POST';
    incrementEvent.path = '/increment';
    const incrementResult = await incrementHandler(incrementEvent);
    console.log(`Status: ${incrementResult.statusCode}`);
    console.log(`Response: ${incrementResult.body}`);
    console.log('');

    if (incrementResult.statusCode !== 200) {
      console.error('Failed to increment counter');
    } else {
      const incrementedValue = JSON.parse(incrementResult.body).value;
      console.log(`Counter incremented from ${initialValue} to ${incrementedValue}`);
      console.log('');
    }

    // Test 3: Verify increment
    console.log('Test 3: GET /count - Verify increment');
    console.log('--------------------------------------');
    const getResult2 = await getCountHandler(getEvent);
    console.log(`Status: ${getResult2.statusCode}`);
    console.log(`Response: ${getResult2.body}`);
    console.log('');

    if (getResult2.statusCode === 200) {
      const currentValue = JSON.parse(getResult2.body).value;
      if (currentValue === initialValue + 1) {
        console.log('✓ Increment verified successfully');
      } else {
        console.warn(`⚠ Unexpected value: expected ${initialValue + 1}, got ${currentValue}`);
      }
    }
    console.log('');

    // Test 4: Decrement counter
    console.log('Test 4: POST /decrement - Decrement counter');
    console.log('--------------------------------------------');
    const decrementEvent = createMockEvent();
    decrementEvent.httpMethod = 'POST';
    decrementEvent.path = '/decrement';
    const decrementResult = await decrementHandler(decrementEvent);
    console.log(`Status: ${decrementResult.statusCode}`);
    console.log(`Response: ${decrementResult.body}`);
    console.log('');

    if (decrementResult.statusCode !== 200) {
      console.error('Failed to decrement counter');
    } else {
      const decrementedValue = JSON.parse(decrementResult.body).value;
      console.log(`Counter decremented to ${decrementedValue}`);
      console.log('');
    }

    // Test 5: Verify decrement
    console.log('Test 5: GET /count - Verify decrement');
    console.log('--------------------------------------');
    const getResult3 = await getCountHandler(getEvent);
    console.log(`Status: ${getResult3.statusCode}`);
    console.log(`Response: ${getResult3.body}`);
    console.log('');

    if (getResult3.statusCode === 200) {
      const finalValue = JSON.parse(getResult3.body).value;
      if (finalValue === initialValue) {
        console.log('✓ Decrement verified successfully');
      } else {
        console.warn(`⚠ Unexpected value: expected ${initialValue}, got ${finalValue}`);
      }
    }
    console.log('');

    console.log('=====================================');
    console.log('All Tests Completed!');
    console.log('=====================================');
  } catch (error) {
    console.error('');
    console.error('=====================================');
    console.error('Test Failed!');
    console.error('=====================================');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('');
    console.log('Test execution completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('Test execution failed:', error);
    process.exit(1);
  });
