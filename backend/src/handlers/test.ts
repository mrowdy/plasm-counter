/**
 * Minimal Lambda Handler for Docker Setup Verification
 */

interface LambdaEvent {
  [key: string]: unknown;
}

interface LambdaResponse {
  statusCode: number;
  body: string;
}

/**
 * Simple test handler to verify Docker setup works
 */
export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  console.log('Docker setup works! Lambda handler invoked.');
  console.log('Event:', JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Docker setup successful!',
      timestamp: new Date().toISOString(),
      event: event
    })
  };
}
