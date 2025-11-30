// src/features/languages/types.ts
// Assumptions:
// - Features are organized under /src/features
// - This file contains strict TypeScript types for language API, shared error, and async state
// - Intended for import into slices, services, and hooks

/**
 * Represents a single language item from the API.
 */
export interface Language {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
}

/**
 * Shape of the full API response for the languages endpoint.
 */
export interface LanguagesResponse {
  success: boolean;
  data: Language[];
}

/**
 * Predictable shape for API errors throughout frontend.
 */
export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

/**
 * Standard async state wrapper for Redux slices.
 * T is the data type (e.g., Language[]), E is error type (ApiError by default).
 */
export interface AsyncState<T, E = ApiError> {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: T | null;
  error: E | null;
}

/**
 * Utility type: The default async state for list endpoints.
 */
export type LanguagesState = AsyncState<Language[]>;
