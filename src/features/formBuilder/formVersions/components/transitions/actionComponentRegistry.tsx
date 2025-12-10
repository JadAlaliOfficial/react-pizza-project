// src/features/formVersion/components/transitions/actionComponentRegistry.ts

/**
 * Action Component Registry
 * Maps ActionType to corresponding configuration component
 * Provides type-safe dynamic component resolution for transition actions
 */

import React from 'react';
import type { ActionType } from '../../types/formVersion.ui-types';

// ============================================================================
// Component Prop Types
// ============================================================================

/**
 * Props for action configuration components
 * Used to edit action-specific properties
 */
export interface ActionComponentProps<TProps = Record<string, any>> {
  /**
   * Current action properties
   */
  value: TProps;

  /**
   * Callback when properties change
   */
  onChange: (value: TProps) => void;

  /**
   * Action index in the transition (for display)
   */
  actionIndex: number;
}

// ============================================================================
// Component Type
// ============================================================================

export type ActionConfigComponent = React.ComponentType<ActionComponentProps<any>>;

// ============================================================================
// Registry Type
// ============================================================================

/**
 * Registry mapping ActionType to config component
 */
export type ActionComponentRegistry = Record<ActionType, ActionConfigComponent>;

// ============================================================================
// Default/Fallback Component
// ============================================================================

/**
 * Default action component shown when action type is not registered
 * Provides basic JSON editor for action properties
 */
const DefaultActionConfig: ActionConfigComponent = ({ value, onChange, actionIndex }) => {
  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900">
          Unknown Action Type (Action {actionIndex + 1})
        </p>
        <p className="text-xs text-gray-500">
          No configuration component registered for this action type
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          Action Properties (JSON)
        </label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              onChange(parsed);
            } catch (error) {
              // Invalid JSON, ignore
              console.warn('[DefaultActionConfig] Invalid JSON:', error);
            }
          }}
          rows={8}
          className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <p className="mt-3 text-xs text-gray-500">
        💡 Register a custom config component for this action type in actionComponentRegistry.ts
      </p>
    </div>
  );
};

// ============================================================================
// Import Action Components
// ============================================================================

// Call Webhook Action (REGISTERED)
import { CallWebhookActionConfig } from './actions/CallWebhookActionConfig';

// Send Email Action (REGISTERED)
import { SendEmailActionConfig } from './actions/SendEmailActionConfig';

// Send Notification Action (REGISTERED)
import { SendNotificationActionConfig } from './actions/SendNotificationActionConfig';

// ============================================================================
// Action Registry
// ============================================================================

/**
 * Maps ActionType to UI configuration component
 * 
 * IMPORTANT: Keys must match the ActionType union exactly:
 * - 'Send Email'
 * - 'Send Notification'
 * - 'Call Webhook'
 * 
 * To add a new action type:
 * 1. Add the type to ActionType union in formVersion.ui-types.ts
 * 2. Create the config component (e.g., MyNewActionConfig.tsx)
 * 3. Import and register it here
 * 4. Update backend actionIdMap if needed
 */
export const actionComponentRegistry: ActionComponentRegistry = {
  'Call Webhook': CallWebhookActionConfig,
  'Send Email': SendEmailActionConfig,
  'Send Notification': SendNotificationActionConfig,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets the config component for an action type
 * Returns default component if action type not registered
 * 
 * @param actionType - Action type to look up
 * @returns Config component for the action type
 */
export const getActionConfigComponent = (actionType: ActionType): ActionConfigComponent => {
  const component = actionComponentRegistry[actionType];

  if (!component) {
    console.warn(
      `[ActionComponentRegistry] No component registered for action type "${actionType}", using default`
    );
    return DefaultActionConfig;
  }

  return component;
};

/**
 * Checks if an action type has a registered component
 * 
 * @param actionType - Action type to check
 * @returns True if component is registered
 */
export const hasActionConfigComponent = (actionType: ActionType): boolean => {
  return actionType in actionComponentRegistry;
};

/**
 * Gets list of all registered action types
 * 
 * @returns Array of registered action types
 */
export const getRegisteredActionTypes = (): ActionType[] => {
  return Object.keys(actionComponentRegistry) as ActionType[];
};

/**
 * Gets a user-friendly display name for an action type
 * 
 * @param actionType - Action type
 * @returns Display name
 */
export const getActionTypeDisplayName = (actionType: ActionType): string => {
  return actionType; // Already user-friendly
};

/**
 * Gets an icon or emoji for an action type (for UI decoration)
 * 
 * @param actionType - Action type
 * @returns Icon string
 */
export const getActionTypeIcon = (actionType: ActionType): string => {
  switch (actionType) {
    case 'Send Email':
      return '📧';
    case 'Send Notification':
      return '🔔';
    case 'Call Webhook':
      return '🔗';
    default:
      return '⚙️';
  }
};
