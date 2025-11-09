import axios, { type AxiosInstance, AxiosError } from 'axios';

export interface CounterResponse {
  value: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly timestamp: Date;

  constructor(statusCode: number, errorCode: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date();

    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }

  isBoundaryError(): boolean {
    return this.errorCode === 'BoundaryViolation';
  }

  isConcurrentConflict(): boolean {
    return this.errorCode === 'ConcurrentUpdateConflict';
  }

  isNetworkError(): boolean {
    return this.errorCode === 'NetworkError' || this.errorCode === 'TimeoutError';
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleAxiosError(error)
    );
  }

  private handleAxiosError(error: AxiosError<ApiErrorResponse>): never {
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      throw new ApiError(0, 'NetworkError', 'Network error: Please check your connection');
    }

    if (error.code === 'ETIMEDOUT') {
      throw new ApiError(0, 'TimeoutError', 'Request timeout: Server took too long to respond');
    }

    if (error.response) {
      const { status, data } = error.response;
      const errorCode = data?.error || 'UnknownError';
      const message = data?.message || error.message || 'An unknown error occurred';
      throw new ApiError(status, errorCode, message);
    }

    if (error.request) {
      throw new ApiError(0, 'NetworkError', 'No response from server: Please check your connection');
    }

    throw new ApiError(0, 'UnknownError', error.message || 'An unexpected error occurred');
  }

  async getCount(): Promise<number> {
    const response = await this.client.get<CounterResponse>('/count');
    return response.data.value;
  }

  async increment(): Promise<number> {
    const response = await this.client.post<CounterResponse>('/increment');
    return response.data.value;
  }

  async decrement(): Promise<number> {
    const response = await this.client.post<CounterResponse>('/decrement');
    return response.data.value;
  }
}

function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL environment variable is not set. Please check your .env file.');
  }

  return baseUrl;
}

export const apiClient = new ApiClient(getApiBaseUrl());

export async function getCount(): Promise<number> {
  return apiClient.getCount();
}

export async function increment(): Promise<number> {
  return apiClient.increment();
}

export async function decrement(): Promise<number> {
  return apiClient.decrement();
}
