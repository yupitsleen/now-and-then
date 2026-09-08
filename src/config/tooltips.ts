/**
 * Centralized Tooltip Content Configuration
 *
 * All tooltip text in one place for:
 * - Easy maintenance
 * - Consistency across the app
 * - Future translation to Arabic via i18n
 *
 * NOTE: Many tooltips use translation keys from src/i18n/en.ts
 * This file contains NEW tooltips that don't yet have translation keys.
 * Eventually these should be moved to i18n system.
 */

/**
 * Header tooltips
 */
export const HEADER_TOOLTIPS = {
  HELP: "View page instructions and keyboard shortcuts",
  LANGUAGE: "Switch language", // Note: Could be made dynamic to show current language
  DARK_MODE_ON: "Switch to light mode",
  DARK_MODE_OFF: "Switch to dark mode",
  MENU_OPEN: "Open navigation menu",
  MENU_CLOSE: "Close navigation menu",
} as const;

/**
 * Navigation link tooltips
 */
export const NAVIGATION_TOOLTIPS = {
  DASHBOARD: "Interactive map and timeline overview",
  TIMELINE: "Satellite comparison with historical imagery",
  DATA: "Full table view with export options",
  STATS: "Statistical analysis and impact data",
  ABOUT: "Project information and methodology",
  RESOURCES: "Donation links and external resources",
} as const;

/**
 * Timeline control tooltips
 */
export const TIMELINE_TOOLTIPS = {
  // Note: Play tooltip uses translation key: timeline.playTooltip
  PAUSE: "Pause timeline animation",
  RESET: "Reset timeline to start and clear site selection",
  PREV_EVENT: "Jump to previous destruction event",
  NEXT_EVENT: "Jump to next destruction event",
  SPEED: "Timeline animation playback speed",
  SYNC_MAP: "Automatically update satellite imagery to match timeline date",
  ZOOM_TO_SITE: "Automatically zoom map to selected heritage site",
  SHOW_MARKERS: "Display markers for all heritage sites on map",
} as const;

/**
 * Wayback slider tooltips
 */
export const WAYBACK_TOOLTIPS = {
  PREV_RELEASE: "Go to previous satellite image release",
  NEXT_RELEASE: "Go to next satellite image release",
  COMPARISON_MODE: "Show before/after satellite maps side-by-side",
  INTERVAL: "Time gap between before/after satellite images",
  SYNC_VERSION: "Auto-sync map imagery when clicking timeline events",
} as const;

/**
 * Filter bar tooltips
 */
export const FILTER_TOOLTIPS = {
  CLEAR_SEARCH: "Clear search",
  TYPE_FILTER: "Filter by heritage site type (mosque, church, archaeological site, etc.)",
  STATUS_FILTER: "Filter by damage status (destroyed, heavily damaged, etc.)",
  DATE_FILTER: "Filter by date of destruction",
  YEAR_FILTER: "Filter by year built (supports BCE dates)",
  CLEAR_ALL: "Remove all active filters",
  OPEN_MOBILE: "Open filters panel",
  REMOVE_PILL: "Remove this filter",
} as const;

/**
 * Table tooltips
 */
export const TABLE_TOOLTIPS = {
  EXPAND: "Open full table view in new page",
  EXPORT_FORMAT: "Choose export file format (CSV, JSON, or GeoJSON)",
  EXPORT_BUTTON: "Download filtered sites",
  SORT_COLUMN: "Click to sort",
  SORT_ASC: "Sorted ascending - click to reverse",
  SORT_DESC: "Sorted descending - click to reverse",
} as const;

/**
 * Map tooltips
 */
export const MAP_TOOLTIPS = {
  ZOOM_TO_SITE: "Automatically zoom to selected heritage sites",
  SHOW_MARKERS: "Display markers for all heritage sites on map",
} as const;

/**
 * Unified tooltip configuration
 */
export const TOOLTIPS = {
  HEADER: HEADER_TOOLTIPS,
  NAVIGATION: NAVIGATION_TOOLTIPS,
  TIMELINE: TIMELINE_TOOLTIPS,
  WAYBACK: WAYBACK_TOOLTIPS,
  FILTERS: FILTER_TOOLTIPS,
  TABLE: TABLE_TOOLTIPS,
  MAP: MAP_TOOLTIPS,
} as const;
