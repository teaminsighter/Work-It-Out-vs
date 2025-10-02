/**
 * Utility functions for text formatting and capitalization
 */

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns The text with first letter of each word capitalized
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalizes the first letter of a string
 * @param text - The text to capitalize
 * @returns The text with first letter capitalized
 */
export function capitalizeFirst(text: string): string {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalizes status words commonly used in admin panels
 * @param status - The status text to format
 * @returns Properly formatted status text
 */
export function capitalizeStatus(status: string): string {
  if (!status) return '';
  
  // Common status mappings
  const statusMappings: { [key: string]: string } = {
    'success': 'Success',
    'failed': 'Failed',
    'fail': 'Failed',
    'error': 'Error',
    'pending': 'Pending',
    'completed': 'Completed',
    'active': 'Active',
    'inactive': 'Inactive',
    'enabled': 'Enabled',
    'disabled': 'Disabled',
    'online': 'Online',
    'offline': 'Offline',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'accepted': 'Accepted',
    'declined': 'Declined',
    'processing': 'Processing',
    'cancelled': 'Cancelled',
    'draft': 'Draft',
    'published': 'Published',
    'archived': 'Archived',
    'new': 'New',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'converted': 'Converted',
    'running': 'Running',
    'paused': 'Paused',
    'stopped': 'Stopped'
  };

  const lowerStatus = status.toLowerCase().trim();
  
  // Check if we have a specific mapping
  if (statusMappings[lowerStatus]) {
    return statusMappings[lowerStatus];
  }
  
  // Fall back to capitalizing each word
  return capitalizeWords(status);
}

/**
 * Capitalizes button text and action words
 * @param text - The button/action text
 * @returns Properly formatted text
 */
export function capitalizeAction(text: string): string {
  if (!text) return '';
  
  // Common action mappings
  const actionMappings: { [key: string]: string } = {
    'accept': 'Accept',
    'reject': 'Reject',
    'approve': 'Approve',
    'decline': 'Decline',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'create': 'Create',
    'update': 'Update',
    'add': 'Add',
    'remove': 'Remove',
    'enable': 'Enable',
    'disable': 'Disable',
    'activate': 'Activate',
    'deactivate': 'Deactivate',
    'start': 'Start',
    'stop': 'Stop',
    'pause': 'Pause',
    'resume': 'Resume',
    'reset': 'Reset',
    'refresh': 'Refresh',
    'load': 'Load',
    'download': 'Download',
    'upload': 'Upload',
    'export': 'Export',
    'import': 'Import',
    'sync': 'Sync',
    'backup': 'Backup',
    'restore': 'Restore'
  };

  const lowerText = text.toLowerCase().trim();
  
  // Check if we have a specific mapping
  if (actionMappings[lowerText]) {
    return actionMappings[lowerText];
  }
  
  // Fall back to capitalizing each word
  return capitalizeWords(text);
}