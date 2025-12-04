
/**
 * Formats a message content string into a short label (e.g., "Msg-1" -> "M1").
 * Used for consistency across Logs, Visualizer, and Consumer status.
 */
export const formatMessageLabel = (content: string | undefined, offset?: number): string => {
  // Priority 1: Use the unique Global Content ID (e.g. "M12") to show uniqueness in the UI.
  if (content && content.startsWith('Msg-')) {
    return content.replace('Msg-', 'M');
  }
  
  if (content) {
    return content.substring(0, 4);
  }

  // Priority 2: Fallback to offset if for some reason content is missing.
  if (offset !== undefined) {
    return `O:${offset}`;
  }
  
  return '?';
};
