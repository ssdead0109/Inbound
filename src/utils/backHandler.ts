/**
 * Unified Global Back Button Priority Stack Manager
 * Supports both Android Capacitor native back button & Web browser popstate
 */

type BackHandlerFn = () => boolean; // return true if handled, false if let next handler run

interface RegisteredHandler {
  id: string;
  priority: number;
  handler: BackHandlerFn;
}

const handlers: RegisteredHandler[] = [];

/**
 * Register a back button handler.
 * Higher priority handlers execute first.
 * If handler returns true, event is consumed.
 */
export const registerBackHandler = (id: string, priority: number, handler: BackHandlerFn): (() => void) => {
  // Remove existing with same ID if any
  const existingIdx = handlers.findIndex((h) => h.id === id);
  if (existingIdx !== -1) {
    handlers.splice(existingIdx, 1);
  }

  handlers.push({ id, priority, handler });
  // Sort descending by priority
  handlers.sort((a, b) => b.priority - a.priority);

  // Return unregister callback
  return () => {
    const idx = handlers.findIndex((h) => h.id === id);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  };
};

/**
 * Trigger back event through the registered handler stack.
 * Returns true if any handler consumed the back event.
 */
export const triggerBack = (): boolean => {
  const currentHandlers = [...handlers];
  for (const item of currentHandlers) {
    try {
      const isHandled = item.handler();
      if (isHandled) {
        return true;
      }
    } catch (err) {
      console.error(`[BackHandler] Error in handler ${item.id}:`, err);
    }
  }
  return false;
};
