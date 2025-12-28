import CryptoJS from 'crypto-js';

// Storage configuration
const STORAGE_KEY = import.meta.env.VITE_TOKEN_STORAGE_KEY;
const SECRET_KEY = import.meta.env.VITE_TOKEN_SECRET_KEY;

/**
 * Save token encrypted to localStorage
 */
export const saveToken = (token: string | null): void => {
  try {
    if (!token) {
      clearToken();
      return;
    }
    
    const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem(STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save encrypted token:', error);
  }
};

/**
 * Load and decrypt token from localStorage
 */
export const loadToken = (): string | null => {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY);
    
    if (!encryptedData) {
      return null;
    }
    
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedToken) {
      // Data couldn't be decrypted, possibly corrupted
      clearToken();
      return null;
    }
    
    return decryptedToken;
  } catch (error) {
    console.error('Failed to load encrypted token:', error);
    // Clear potentially corrupted data
    clearToken();
    return null;
  }
};

/**
 * Clear token from localStorage
 */
export const clearToken = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear token:', error);
  }
};

/**
 * Check if valid token exists in localStorage
 */
export const hasToken = (): boolean => {
  const token = loadToken();
  return !!token;
};

/**
 * Check if token is expired (basic check - you might want to add JWT decode)
 */
export const isTokenExpired = (): boolean => {
  const token = loadToken();
  
  if (!token) return true;
  
  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // You could decode the payload and check exp claim here
    // const payload = JSON.parse(atob(parts[1]));
    // return payload.exp * 1000 < Date.now();
    
    return false;
  } catch (error) {
    return true;
  }
};

// Legacy support - keeping old function names but updating implementation
export const saveTokens = (token: string | null): void => {
  saveToken(token);
};

export const loadTokens = (): { token: string | null; refreshToken: string | null } => {
  return { token: loadToken(), refreshToken: null };
};

export const clearTokens = clearToken;
export const hasTokens = hasToken;
