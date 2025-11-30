/**
 * useLanguage Hook
 * 
 * Custom React hook for managing user language preferences.
 * Wraps Redux dispatch and selectors for easy component integration.
 * Provides memoized functions and data to prevent unnecessary re-renders.
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store'; // Adjust path to your store
import {
  fetchAllLanguages,
  fetchDefaultLanguage,
  updateDefaultLanguage,
  clearError,
  selectLanguages,
  selectDefaultLanguage,
  selectLanguageLoading,
  selectLanguageError,
  selectIsLanguagesStale,
  selectSystemDefaultLanguage,
  selectHasLanguages,
} from '../store/languagesPreferencesSlice';
import type { LanguageNormalized, LanguageOption } from '../types';

// ============================================================================
// Hook Return Type
// ============================================================================

interface UseLanguageReturn {
  // State
  languages: LanguageNormalized[];
  defaultLanguage: LanguageNormalized | null;
  loading: boolean;
  error: string | null;
  hasLanguages: boolean;
  isStale: boolean;
  systemDefaultLanguage: LanguageNormalized | null;
  
  // Actions
  refreshLanguages: () => Promise<void>;
  refreshDefaultLanguage: () => Promise<void>;
  updateDefaultLanguage: (languageId: number) => Promise<void>;
  clearError: () => void;
  
  // Helper Functions
  getLanguageById: (id: number) => LanguageNormalized | undefined;
  getLanguageByCode: (code: string) => LanguageNormalized | undefined;
  getLanguageOptions: () => LanguageOption[];
  isDefaultLanguage: (languageId: number) => boolean;
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook for managing user language preferences
 * 
 * @returns Object containing language state and actions
 * 
 * @example
 * ```
 * function LanguageSelector() {
 *   const {
 *     languages,
 *     defaultLanguage,
 *     loading,
 *     updateDefaultLanguage
 *   } = useLanguage();
 *   
 *   const handleChange = async (languageId: number) => {
 *     await updateDefaultLanguage(languageId);
 *   };
 *   
 *   return (
 *     <select 
 *       value={defaultLanguage?.id} 
 *       onChange={(e) => handleChange(Number(e.target.value))}
 *       disabled={loading}
 *     >
 *       {languages.map(lang => (
 *         <option key={lang.id} value={lang.id}>
 *           {lang.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export const useLanguage = (): UseLanguageReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // ============================================================================
  // Selectors
  // ============================================================================

  const languages = useSelector(selectLanguages);
  const defaultLanguage = useSelector(selectDefaultLanguage);
  const loading = useSelector(selectLanguageLoading);
  const error = useSelector(selectLanguageError);
  const isStale = useSelector(selectIsLanguagesStale);
  const systemDefaultLanguage = useSelector(selectSystemDefaultLanguage);
  const hasLanguages = useSelector(selectHasLanguages);

  // ============================================================================
  // Action Dispatchers (Memoized)
  // ============================================================================

  /**
   * Fetch all available languages from the API
   * Automatically called if languages are stale or empty
   */
  const refreshLanguages = useCallback(async (): Promise<void> => {
    try {
      console.debug('[useLanguage] Refreshing all languages');
      await dispatch(fetchAllLanguages()).unwrap();
    } catch (error) {
      console.error('[useLanguage] Failed to refresh languages:', error);
      throw error; // Re-throw so component can handle if needed
    }
  }, [dispatch]);

  /**
   * Fetch user's default language from the API
   */
  const refreshDefaultLanguage = useCallback(async (): Promise<void> => {
    try {
      console.debug('[useLanguage] Refreshing default language');
      await dispatch(fetchDefaultLanguage()).unwrap();
    } catch (error) {
      console.error('[useLanguage] Failed to refresh default language:', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * Update user's default language
   * 
   * @param languageId - ID of the language to set as default
   */
  const handleUpdateDefaultLanguage = useCallback(
    async (languageId: number): Promise<void> => {
      try {
        console.debug('[useLanguage] Updating default language to ID:', languageId);
        await dispatch(updateDefaultLanguage(languageId)).unwrap();
        console.info('[useLanguage] Default language updated successfully');
      } catch (error) {
        console.error('[useLanguage] Failed to update default language:', error);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Clear any error messages
   */
  const handleClearError = useCallback((): void => {
    dispatch(clearError());
  }, [dispatch]);

  // ============================================================================
  // Helper Functions (Memoized)
  // ============================================================================

  /**
   * Get language by ID
   */
  const getLanguageById = useCallback(
    (id: number): LanguageNormalized | undefined => {
      return languages.find((lang) => lang.id === id);
    },
    [languages]
  );

  /**
   * Get language by code (e.g., 'en', 'ar', 'es')
   */
  const getLanguageByCode = useCallback(
    (code: string): LanguageNormalized | undefined => {
      return languages.find((lang) => lang.code === code);
    },
    [languages]
  );

  /**
   * Convert languages to options format for select/dropdown components
   * Sorted with default language first
   */
  const getLanguageOptions = useCallback((): LanguageOption[] => {
    return languages
      .map((lang) => ({
        value: lang.id,
        label: lang.name,
        code: lang.code,
        isDefault: lang.isDefault,
      }))
      .sort((a, b) => {
        // Default language first
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        // Then alphabetically
        return a.label.localeCompare(b.label);
      });
  }, [languages]);

  /**
   * Check if a language ID is the user's default language
   */
  const isDefaultLanguageId = useCallback(
    (languageId: number): boolean => {
      return defaultLanguage?.id === languageId;
    },
    [defaultLanguage]
  );

  // ============================================================================
  // Auto-fetch logic
  // ============================================================================

  /**
   * Automatically fetch languages if needed
   * This runs only once when hook is first used and languages are empty or stale
   */
  useMemo(() => {
    if (!hasLanguages || isStale) {
      console.debug('[useLanguage] Auto-fetching languages (empty or stale)');
      refreshLanguages().catch((error) => {
        console.error('[useLanguage] Auto-fetch failed:', error);
      });
    }
  }, [hasLanguages, isStale, refreshLanguages]);

  /**
   * Auto-fetch default language if languages exist but default is not set
   */
  useMemo(() => {
    if (hasLanguages && !defaultLanguage && !loading) {
      console.debug('[useLanguage] Auto-fetching default language');
      refreshDefaultLanguage().catch((error) => {
        console.error('[useLanguage] Auto-fetch default language failed:', error);
      });
    }
  }, [hasLanguages, defaultLanguage, loading, refreshDefaultLanguage]);

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // State
    languages,
    defaultLanguage,
    loading,
    error,
    hasLanguages,
    isStale,
    systemDefaultLanguage,

    // Actions
    refreshLanguages,
    refreshDefaultLanguage,
    updateDefaultLanguage: handleUpdateDefaultLanguage,
    clearError: handleClearError,

    // Helpers
    getLanguageById,
    getLanguageByCode,
    getLanguageOptions,
    isDefaultLanguage: isDefaultLanguageId,
  };
};

// ============================================================================
// Export as default as well
// ============================================================================

export default useLanguage;
