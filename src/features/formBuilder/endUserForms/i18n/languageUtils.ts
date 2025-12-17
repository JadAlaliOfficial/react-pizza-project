/**
 * ================================
 * LANGUAGE & RTL UTILITIES
 * ================================
 * 
 * Centralized utilities for handling language and text direction (RTL/LTR).
 * 
 * Key Responsibilities:
 * - Provide language configuration lookups
 * - Determine text direction based on language
 * - Generate CSS classes for RTL/LTR layouts
 * - Provide utility functions for directional styling
 * - Handle language-specific formatting
 * 
 * Architecture Decisions:
 * - Pure utility functions with no React dependencies
 * - Stateless - all configuration comes from runtime.types
 * - Can be used in components, hooks, or anywhere in the app
 * - Type-safe with exhaustive language handling
 * - Supports expansion to additional languages
 * 
 * Usage Pattern:
 * - Import utilities where needed (components, hooks, etc.)
 * - Use getLanguageConfig to get language metadata
 * - Use isRTL to check direction
 * - Apply directional class names for layout adjustments
 */

import type { LanguageId, LanguageConfig, Direction } from '../types/runtime.types';
import { LANGUAGE_MAP } from '../types/runtime.types';

// ================================
// LANGUAGE CONFIGURATION
// ================================

/**
 * Get language configuration by ID
 * 
 * @param languageId - Language ID (1=English, 2=Arabic, 3=Spanish)
 * @returns Language configuration object
 * @throws Error if language ID is invalid
 */
export function getLanguageConfig(languageId: LanguageId): LanguageConfig {
  const config = LANGUAGE_MAP[languageId];
  
  if (!config) {
    console.error(`[languageUtils] Invalid language ID: ${languageId}, falling back to English`);
    return LANGUAGE_MAP[1]; // Default to English
  }
  
  return config;
}

/**
 * Get language code by ID
 * 
 * @param languageId - Language ID
 * @returns Language code (e.g., 'en', 'ar', 'es')
 */
export function getLanguageCode(languageId: LanguageId): string {
  const config = getLanguageConfig(languageId);
  return config.code;
}

/**
 * Get language display name by ID
 * 
 * @param languageId - Language ID
 * @returns Language name in its native script
 */
export function getLanguageName(languageId: LanguageId): string {
  const config = getLanguageConfig(languageId);
  return config.name;
}

/**
 * Get all available language configurations
 * 
 * @returns Array of all language configurations
 */
export function getAllLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGE_MAP);
}

/**
 * Check if a language ID is valid
 * 
 * @param languageId - Language ID to check
 * @returns True if valid, false otherwise
 */
export function isValidLanguageId(languageId: number): languageId is LanguageId {
  return languageId in LANGUAGE_MAP;
}

// ================================
// TEXT DIRECTION (RTL/LTR)
// ================================

/**
 * Get text direction for a language
 * 
 * @param languageId - Language ID
 * @returns Text direction ('ltr' or 'rtl')
 */
export function getTextDirection(languageId: LanguageId): Direction {
  const config = getLanguageConfig(languageId);
  return config.direction;
}

/**
 * Check if a language uses RTL (right-to-left) text direction
 * 
 * @param languageId - Language ID
 * @returns True if RTL, false if LTR
 */
export function isRTL(languageId: LanguageId): boolean {
  return getTextDirection(languageId) === 'rtl';
}

/**
 * Check if a language uses LTR (left-to-right) text direction
 * 
 * @param languageId - Language ID
 * @returns True if LTR, false if RTL
 */
export function isLTR(languageId: LanguageId): boolean {
  return getTextDirection(languageId) === 'ltr';
}

// ================================
// CSS CLASS NAME GENERATION
// ================================

/**
 * Get direction class name for applying to root elements
 * Use this on container elements to apply directional styles
 * 
 * @param languageId - Language ID
 * @returns CSS class name ('rtl' or 'ltr')
 * 
 * @example
 * ```
 * <div className={getDirectionClass(languageId)}>
 *   {content}
 * </div>
 * ```
 */
export function getDirectionClass(languageId: LanguageId): string {
  return getTextDirection(languageId);
}

/**
 * Get conditional class names based on text direction
 * Returns different class names for RTL vs LTR
 * 
 * @param languageId - Language ID
 * @param rtlClass - Class name to use for RTL
 * @param ltrClass - Class name to use for LTR
 * @returns Appropriate class name based on direction
 * 
 * @example
 * ```
 * <div className={getDirectionalClass(languageId, 'mr-4', 'ml-4')}>
 *   Icon on the start side
 * </div>
 * ```
 */
export function getDirectionalClass(
  languageId: LanguageId,
  rtlClass: string,
  ltrClass: string
): string {
  return isRTL(languageId) ? rtlClass : ltrClass;
}

/**
 * Get margin start class (left in LTR, right in RTL)
 * 
 * @param languageId - Language ID
 * @param size - Tailwind spacing size (e.g., '4', '8')
 * @returns Appropriate margin class
 * 
 * @example
 * ```
 * <span className={getMarginStartClass(languageId, '2')}>Text</span>
 * // Returns 'ml-2' for LTR, 'mr-2' for RTL
 * ```
 */
export function getMarginStartClass(languageId: LanguageId, size: string): string {
  return isRTL(languageId) ? `mr-${size}` : `ml-${size}`;
}

/**
 * Get margin end class (right in LTR, left in RTL)
 * 
 * @param languageId - Language ID
 * @param size - Tailwind spacing size (e.g., '4', '8')
 * @returns Appropriate margin class
 */
export function getMarginEndClass(languageId: LanguageId, size: string): string {
  return isRTL(languageId) ? `ml-${size}` : `mr-${size}`;
}

/**
 * Get padding start class (left in LTR, right in RTL)
 * 
 * @param languageId - Language ID
 * @param size - Tailwind spacing size (e.g., '4', '8')
 * @returns Appropriate padding class
 */
export function getPaddingStartClass(languageId: LanguageId, size: string): string {
  return isRTL(languageId) ? `pr-${size}` : `pl-${size}`;
}

/**
 * Get padding end class (right in LTR, left in RTL)
 * 
 * @param languageId - Language ID
 * @param size - Tailwind spacing size (e.g., '4', '8')
 * @returns Appropriate padding class
 */
export function getPaddingEndClass(languageId: LanguageId, size: string): string {
  return isRTL(languageId) ? `pl-${size}` : `pr-${size}`;
}

/**
 * Get text alignment class
 * 
 * @param languageId - Language ID
 * @returns Text alignment class ('text-right' for RTL, 'text-left' for LTR)
 */
export function getTextAlignClass(languageId: LanguageId): string {
  return isRTL(languageId) ? 'text-right' : 'text-left';
}

/**
 * Get flex direction class for row layouts
 * 
 * @param languageId - Language ID
 * @returns Flex direction class ('flex-row-reverse' for RTL, 'flex-row' for LTR)
 */
export function getFlexRowClass(languageId: LanguageId): string {
  return isRTL(languageId) ? 'flex-row-reverse' : 'flex-row';
}

// ================================
// HTML ATTRIBUTES
// ================================

/**
 * Get dir attribute value for HTML elements
 * Use this on the root element or container elements
 * 
 * @param languageId - Language ID
 * @returns 'rtl' or 'ltr'
 * 
 * @example
 * ```
 * <html dir={getDirAttribute(languageId)} lang={getLanguageCode(languageId)}>
 * ```
 */
export function getDirAttribute(languageId: LanguageId): Direction {
  return getTextDirection(languageId);
}

/**
 * Get lang attribute value for HTML elements
 * 
 * @param languageId - Language ID
 * @returns Language code (e.g., 'en', 'ar', 'es')
 */
export function getLangAttribute(languageId: LanguageId): string {
  return getLanguageCode(languageId);
}

// ================================
// DIRECTIONAL VALUES
// ================================

/**
 * Get a directional value (useful for inline styles or logic)
 * Returns different values based on text direction
 * 
 * @param languageId - Language ID
 * @param rtlValue - Value to return for RTL
 * @param ltrValue - Value to return for LTR
 * @returns Appropriate value based on direction
 * 
 * @example
 * ```
 * const iconPosition = getDirectionalValue(languageId, 'right', 'left');
 * ```
 */
export function getDirectionalValue<T>(
  languageId: LanguageId,
  rtlValue: T,
  ltrValue: T
): T {
  return isRTL(languageId) ? rtlValue : ltrValue;
}

/**
 * Flip a numeric value for RTL (useful for transforms, positioning)
 * 
 * @param languageId - Language ID
 * @param value - Numeric value to potentially flip
 * @returns Original value for LTR, negated value for RTL
 * 
 * @example
 * ```
 * const translateX = flipValueForRTL(languageId, 100); // -100 for RTL, 100 for LTR
 * ```
 */
export function flipValueForRTL(languageId: LanguageId, value: number): number {
  return isRTL(languageId) ? -value : value;
}

// ================================
// BROWSER INTEGRATION
// ================================

/**
 * Apply language and direction to document root
 * Call this when language changes to update the entire page
 * 
 * @param languageId - Language ID
 * 
 * @example
 * ```
 * useEffect(() => {
 *   applyLanguageToDocument(currentLanguageId);
 * }, [currentLanguageId]);
 * ```
 */
export function applyLanguageToDocument(languageId: LanguageId): void {
  const htmlElement = document.documentElement;
  const config = getLanguageConfig(languageId);
  
  // Set dir attribute
  htmlElement.setAttribute('dir', config.direction);
  
  // Set lang attribute
  htmlElement.setAttribute('lang', config.code);
  
  // Add/remove RTL class for CSS targeting
  if (config.direction === 'rtl') {
    htmlElement.classList.add('rtl');
    htmlElement.classList.remove('ltr');
  } else {
    htmlElement.classList.add('ltr');
    htmlElement.classList.remove('rtl');
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[languageUtils] Applied language to document: ${config.name} (${config.code}, ${config.direction})`);
  }
}

/**
 * Remove language attributes from document root
 * Use when cleaning up or resetting
 */
export function removeLanguageFromDocument(): void {
  const htmlElement = document.documentElement;
  
  htmlElement.removeAttribute('dir');
  htmlElement.classList.remove('rtl', 'ltr');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[languageUtils] Removed language attributes from document');
  }
}

// ================================
// DEBUGGING
// ================================

/**
 * Log current language configuration (development only)
 * 
 * @param languageId - Language ID
 */
export function debugLanguageConfig(languageId: LanguageId): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const config = getLanguageConfig(languageId);
  
  console.group('[languageUtils] Language Configuration');
  console.log('ID:', config.id);
  console.log('Code:', config.code);
  console.log('Name:', config.name);
  console.log('Direction:', config.direction);
  console.log('Is RTL:', isRTL(languageId));
  console.groupEnd();
}

// ================================
// EXPORTS
// ================================

/**
 * Language utilities public API
 */
export const languageUtils = {
  // Configuration
  getLanguageConfig,
  getLanguageCode,
  getLanguageName,
  getAllLanguages,
  isValidLanguageId,
  
  // Direction
  getTextDirection,
  isRTL,
  isLTR,
  
  // CSS Classes
  getDirectionClass,
  getDirectionalClass,
  getMarginStartClass,
  getMarginEndClass,
  getPaddingStartClass,
  getPaddingEndClass,
  getTextAlignClass,
  getFlexRowClass,
  
  // HTML Attributes
  getDirAttribute,
  getLangAttribute,
  
  // Directional Values
  getDirectionalValue,
  flipValueForRTL,
  
  // Browser Integration
  applyLanguageToDocument,
  removeLanguageFromDocument,
  
  // Debugging
  debugLanguageConfig,
};
