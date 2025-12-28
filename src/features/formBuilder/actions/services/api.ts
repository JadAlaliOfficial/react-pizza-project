// features/actions/actions.service.ts

import axios, { AxiosError } from 'axios';
import { loadToken } from '../../../auth/utils/tokenStorage'; // Auth token utility
import { type ActionRaw, type Action, type ListActionsResponseRaw, parseActionProps } from '../types';

// Simple logger utility (for structured environment-aware logs)
// Replace with a full logger (winston, etc.) if infrastructure exists.
const log = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // Only log debug info in dev.
      console.debug('[actionsService][DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // Info logs for dev/stage.
      console.info('[actionsService][INFO]', ...args);
    }
  },
  error: (...args: unknown[]) => {
      // Always log errors for diagnostics.
      console.error('[actionsService][ERROR]', ...args);
  }
};

// Core async function to GET list of actions.
export async function fetchActions(): Promise<Action[]> {
  const token = loadToken();

  if (!token) {
    log.error('Auth token missing. Cannot call /api/actions.');
    throw new Error('Authentication required.');
  }

  try {
    const response = await axios.get<ListActionsResponseRaw>(
      import.meta.env.VITE_ACTIONS_DAYNAMIC_FORMS_BASE_URL,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': import.meta.env.VITE_API_CONTENT_TYPE,
          Accept: import.meta.env.VITE_API_ACCEPT,
        },
        // No body for GET
        timeout: Number(import.meta.env.VITE_API_TIMEOUT), // sensible timeout (10s)
      }
    );

    // Check basic structure and "success"
    if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
      log.error('Malformed response from actions API:', response.data);
      throw new Error('Invalid response from server.');
    }

    // Validate/normalize each ActionRaw, parse props_description
    const actions: Action[] = response.data.data.map((item: ActionRaw) => {
      let parsed_props: Action['parsed_props'];
      parsed_props = parseActionProps(item.name, item.props_description);

      if (parsed_props === undefined) {
        log.info(`Props parsing failed for action '${item.name}' (id=${item.id}). Keeping raw string.`);
        // Do not throw; keep raw string for diagnostics/UI.
      }

      return {
        ...item,
        parsed_props, // either parsed object or undefined
      };
    });

    log.debug(`Fetched ${actions.length} actions.`);
    return actions;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError;
      log.error('Network/API error:', err.message, err.response?.status, err.response?.data);

      // Mapped error reporting:
      if (err.response) {
        // Non-2xx response
        throw new Error(`API error: ${err.response.status} - ${err.response.statusText}`);
      } else if (err.code === 'ECONNABORTED') {
        throw new Error('Network timeout. Please try again.');
      }
      throw new Error('Network error. Please check your connection.');
    } else {
      // Unknown error
      log.error('Unexpected error in fetchActions:', error);
      throw new Error('Unexpected error occurred.');
    }
  }
}

/**
 * This service pattern is scalable:
 * - Add other exports for PUT/POST etc. endpoints here.
 * - Always validate auth and response.
 * - Avoid noisy logging in production.
 * - All returned data should be validated/normalized for UI.
 */
