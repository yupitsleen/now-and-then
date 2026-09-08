/**
 * Timeline component configuration constants
 */

/**
 * Timeline dimensions
 */
export const TIMELINE_CONFIG = {
  /** Left/right margin for timeline (space for handles) */
  MARGIN: 50,
  /** SVG height for timeline visualization — the axis sits near the bottom and
   *  same-day events stack above it, so this is baseline + stack + tick labels */
  HEIGHT: 64,
  /** Minimum height for timeline container */
  MIN_HEIGHT: "64px",
} as const;

/**
 * Custom marker icon configuration for SiteDetailView
 */
export const SITE_MARKER_CONFIG = {
  /** Icon size [width, height] */
  ICON_SIZE: [20, 20] as [number, number],
  /** Icon anchor point [x, y] */
  ICON_ANCHOR: [10, 10] as [number, number],
} as const;
