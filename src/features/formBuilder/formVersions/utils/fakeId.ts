// src/features/formVersion/utils/fakeId.ts

/**
 * Fake ID Utility
 * Generates and validates fake IDs for new entities before they're saved
 * Used in Form Version Builder for stages, sections, and fields
 */

/**
 * Generates a unique fake ID for new entities
 * Format: "FAKE_" + timestamp + random
 * 
 * @returns A unique fake ID string
 * 
 * @example
 * const newId = generateFakeId(); // "FAKE_1701234567890_abc123"
 */
export const generateFakeId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const fakeId = `FAKE_${timestamp}_${random}`;
  
  console.debug('[FakeId] Generated fake ID:', fakeId);
  
  return fakeId;
};

/**
 * Checks if an ID is a fake ID (not yet saved to database)
 * 
 * @param id - The ID to check (can be string or number)
 * @returns True if ID is a fake ID, false otherwise
 * 
 * @example
 * isFakeId("FAKE_123") // true
 * isFakeId(123) // false
 * isFakeId("123") // false
 */
export const isFakeId = (id: string | number): boolean => {
  if (typeof id === 'number') {
    return false;
  }
  
  return typeof id === 'string' && id.startsWith('FAKE_');
};

/**
 * Validates that a fake ID has the correct format
 * 
 * @param id - The fake ID to validate
 * @returns True if format is valid, false otherwise
 * 
 * @example
 * isValidFakeId("FAKE_1701234567890_abc123") // true
 * isValidFakeId("FAKE_invalid") // false
 * isValidFakeId("not_fake") // false
 */
export const isValidFakeId = (id: string): boolean => {
  if (!isFakeId(id)) {
    return false;
  }
  
  // Pattern: FAKE_{timestamp}_{random}
  const pattern = /^FAKE_\d+_[a-z0-9]+$/;
  return pattern.test(id);
};

/**
 * Converts a fake ID to null for API requests
 * Real IDs are returned unchanged
 * 
 * Used when building API request payloads where backend expects
 * null for new entities instead of fake IDs
 * 
 * @param id - The ID to convert
 * @returns null if fake ID, original ID otherwise
 * 
 * @example
 * fakeIdToNull("FAKE_123") // null
 * fakeIdToNull(123) // 123
 * fakeIdToNull("123") // "123"
 */
export const fakeIdToNull = (id: string | number): number | string | null => {
  if (isFakeId(id)) {
    return null;
  }
  return id;
};

/**
 * Filters an array to only include entities with real IDs (not fake)
 * Useful for operations that should only apply to saved entities
 * 
 * @param entities - Array of entities with id property
 * @returns Filtered array with only real IDs
 * 
 * @example
 * const saved = filterRealIds([
 *   { id: 1, name: "A" },
 *   { id: "FAKE_123", name: "B" },
 *   { id: 2, name: "C" }
 * ]); // [{ id: 1, name: "A" }, { id: 2, name: "C" }]
 */
export const filterRealIds = <T extends { id: string | number }>(
  entities: T[]
): T[] => {
  return entities.filter((entity) => !isFakeId(entity.id));
};

/**
 * Filters an array to only include entities with fake IDs
 * Useful for identifying which entities are new and need to be created
 * 
 * @param entities - Array of entities with id property
 * @returns Filtered array with only fake IDs
 * 
 * @example
 * const unsaved = filterFakeIds([
 *   { id: 1, name: "A" },
 *   { id: "FAKE_123", name: "B" },
 *   { id: 2, name: "C" }
 * ]); // [{ id: "FAKE_123", name: "B" }]
 */
export const filterFakeIds = <T extends { id: string | number }>(
  entities: T[]
): T[] => {
  return entities.filter((entity) => isFakeId(entity.id));
};

/**
 * Counts how many entities have fake IDs
 * 
 * @param entities - Array of entities with id property
 * @returns Count of entities with fake IDs
 * 
 * @example
 * countFakeIds([
 *   { id: 1, name: "A" },
 *   { id: "FAKE_123", name: "B" },
 *   { id: "FAKE_456", name: "C" }
 * ]); // 2
 */
export const countFakeIds = <T extends { id: string | number }>(
  entities: T[]
): number => {
  return entities.filter((entity) => isFakeId(entity.id)).length;
};

/**
 * Maps fake IDs to real IDs after save operation
 * Used to update local state after backend assigns real IDs
 * 
 * @param fakeToRealMap - Map of fake ID → real ID
 * @param id - ID to potentially convert
 * @returns Real ID if mapping exists, original ID otherwise
 * 
 * @example
 * const map = { "FAKE_123": 10, "FAKE_456": 11 };
 * mapFakeToReal(map, "FAKE_123") // 10
 * mapFakeToReal(map, 5) // 5
 */
export const mapFakeToReal = (
  fakeToRealMap: Record<string, number>,
  id: string | number
): string | number => {
  if (typeof id === 'string' && id in fakeToRealMap) {
    return fakeToRealMap[id];
  }
  return id;
};
