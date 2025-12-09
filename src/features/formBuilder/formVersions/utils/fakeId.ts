// src/features/formVersion/utils/fakeId.ts

/**
 * Fake ID generation utility
 * Provides consistent fake ID generation for UI-only entities
 * Fake IDs are used for entities not yet persisted to the backend
 */

import type { FakeId } from '../types/formVersion.ui-types';

/**
 * Generates a random integer for fake IDs
 * Uses timestamp + random number for uniqueness
 * @returns Random integer
 */
export function generateFakeIdNumber(): number {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const id = timestamp * 1000000 + random;
  
  console.debug(`[FakeId] Generated fake ID number: ${id}`);
  
  return id;
}

/**
 * Generates a fake ID string in the format "FAKE_<number>"
 * Example: "FAKE_1702056789123456"
 * @returns Fake ID string
 */
export function generateFakeId(): FakeId {
  const id = `FAKE_${generateFakeIdNumber()}` as FakeId;
  
  console.debug(`[FakeId] Generated fake ID: ${id}`);
  
  return id;
}
