// features/actions/actions.types.ts

/**
 * Types and utilities for Action API entities and response envelopes.
 * These types are the source of truth for all code consuming /api/actions.
 */

/** ---------- Raw server model (as returned by API) ---------- */

/**
 * Interface for an Action as received from the API.
 * - `props_description` is a JSON string with schema-per-action.
 */
export interface ActionRaw {
  id: number;
  name: string;
  props_description: string; // JSON string from the backend
  is_public: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

/** ---------- Type-safe parsed props objects ---------- */

/**
 * Known prop schemas for recognized action types.
 * For open-ended/unknown, fallback to Record<string, unknown>.
 *
 * You can expand these types as new action types/schemas are added.
 */

export interface CallWebhookProps {
  webhook_url: string;
  webhook_method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  webhook_headers?: string;
  webhook_payload?: string;
  webhook_timeout?: string;
}

export interface SendEmailProps {
  email_subject: string;
  email_content: string;
  email_attachments?: string[];
  receivers_users?: number[];
  receivers_roles?: number[];
  receivers_permissions?: number[];
  receivers_emails?: string[];
  cc_users?: number[];
  cc_emails?: string[];
  bcc_users?: number[];
  bcc_emails?: string[];
}

export interface SendNotificationProps {
  notification_title: string;
  notification_body: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  notification_icon?: string;
  notification_link?: string;
  receivers_users?: number[];
  receivers_roles?: number[];
  receivers_permissions?: number[];
}

/**
 * Union of all known parsed prop object shapes.
 * Extend this union when new action types are defined.
 */
export type ActionPropsParsed =
  | CallWebhookProps
  | SendEmailProps
  | SendNotificationProps
  | Record<string, unknown>; // fallback/catch-all

/**
 * Parsed Action entity, with props_description parsed (if possible).
 * If parsing fails, `parsed_props` is undefined and raw string is kept.
 */
export interface Action {
  id: number;
  name: string;
  // Either a parsed object (typed or generic), or undefined on parse error
  parsed_props?: ActionPropsParsed;
  // Always keep the original raw string for diagnostics/fallback
  props_description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/** ---------- Response envelope from the API ---------- */

export interface ListActionsResponseRaw {
  success: boolean;
  data: ActionRaw[];
}

/**
 * Parse utility for action props_description.
 * Parses the JSON string, assigns a known type when possible, falls back to Record<string, unknown>.
 * On any error, returns undefined.
 */
export function parseActionProps(
  actionName: string,
  propsJson: string
): ActionPropsParsed | undefined {
  try {
    const obj = JSON.parse(propsJson);
    // Optionally: Narrow by action name for stronger typing
    switch (actionName) {
      case 'Call Webhook':
        return obj as CallWebhookProps;
      case 'Send Email':
        return obj as SendEmailProps;
      case 'Send Notification':
        return obj as SendNotificationProps;
      default:
        return obj as Record<string, unknown>;
    }
  } catch (e) {
    // Consumer should log a warning (but avoid noise in prod)
    return undefined;
  }
}
