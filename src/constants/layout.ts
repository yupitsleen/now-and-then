/**
 * Layout and UI component configuration constants
 */

/**
 * Responsive breakpoint thresholds (in pixels)
 *
 * Used for determining mobile/tablet/desktop layouts.
 * Matches Tailwind's default breakpoints (md: 768px, lg: 1024px).
 *
 * @example
 * ```typescript
 * const isMobile = window.innerWidth < BREAKPOINTS.MOBILE;
 * const isTablet = window.innerWidth >= BREAKPOINTS.MOBILE && window.innerWidth < BREAKPOINTS.TABLET;
 * const isDesktop = window.innerWidth >= BREAKPOINTS.TABLET;
 * ```
 */
export const BREAKPOINTS = {
  /** Mobile breakpoint: width < 768px (matches Tailwind 'md') */
  MOBILE: 768,
  /** Tablet breakpoint: 768px ≤ width < 1024px (matches Tailwind 'lg') */
  TABLET: 1024,
  /** Desktop breakpoint: width ≥ 1024px */
  DESKTOP: 1024,
} as const;

/** Width of the collapsed filter sidebar rail, in px. Hosts lay out around it. */
export const SIDEBAR_RAIL_WIDTH = 48;

/**
 * The gap between content columns, in px — Tailwind `gap-2`. Absolutely
 * positioned overlays that align to a column edge have to add it back by hand.
 */
export const CONTENT_GAP_PX = 8;

/**
 * Z-index layers for consistent stacking order
 *
 * Higher values appear above lower values.
 * Use these constants instead of arbitrary z-index values.
 *
 * @example
 * ```typescript
 * <div style={{ zIndex: Z_INDEX.MODAL }}>Modal content</div>
 * <div style={{ zIndex: Z_INDEX.DROPDOWN }}>Dropdown menu</div>
 * ```
 */
export const Z_INDEX = {
  /** Base layer (z-index: 0) */
  BASE: 0,
  /** Background decorations like flag triangle (z-index: 1) - Above base background, below content */
  BACKGROUND_DECORATION: 1,
  /** Content layer (z-index: 10) */
  CONTENT: 10,
  /** Sticky elements like headers (z-index: 1100) - Must be above dropdowns to create proper stacking context */
  STICKY: 1100,
  /** Filter bar container (z-index: 500) - Above maps but below dropdowns */
  FILTER_BAR: 500,
  /** Dropdown menus and popovers (z-index: 1000) */
  DROPDOWN: 1000,
  /** Header dropdown menus (z-index: 1200) - Must be above filter bar and other page content */
  HEADER_DROPDOWN: 1200,
  /** Tooltips (z-index: 1010) */
  TOOLTIP: 1010,
  /** Timeline tooltips (z-index: 9998) - Must be above all page content, just below modals */
  TIMELINE_TOOLTIP: 9998,
  /** Fixed elements like sidebars (z-index: 1020) */
  FIXED: 1020,
  /** Modal overlays and dialogs (z-index: 9999) */
  MODAL: 9999,
  /** Critical notifications (z-index: 10000) */
  NOTIFICATION: 10000,
  /** Dropdowns inside modals (z-index: 10002) - Must be above modal backdrop */
  MODAL_DROPDOWN: 10002,
} as const;

/**
 * Table configuration
 */
export const TABLE_CONFIG = {
  /** Width of the Type column (icon display) in pixels */
  TYPE_COLUMN_WIDTH: 20,

  /** Default initial width for resizable table (Type and Site Name only) */
  DEFAULT_TABLE_WIDTH: 210,

  /** Minimum width for resizable table (Type and Site Name visible) */
  MIN_TABLE_WIDTH: 200,

  /** Maximum width for resizable table */
  MAX_TABLE_WIDTH: 1100,

  /** Width breakpoints for progressive column display */
  COLUMN_BREAKPOINTS: {
    type: 280,               // Unused - Type column always visible (kept for reference)
    status: 360,             // Show Status column at 360px+
    dateDestroyed: 480,      // Show Date Destroyed column at 480px+
    dateDestroyedIslamic: 650, // Show Islamic Date at 650px+
    sourceAssessmentDate: 725, // Show Survey Date at 725px+
    yearBuilt: 800,          // Show Year Built at 800px+
    yearBuiltIslamic: 950,   // Show Islamic Year Built at 950px+
  },
} as const;

/**
 * Timeline configuration
 */
export const TIMELINE_CONFIG = {
  /** Fixed height of timeline scrubber in pixels */
  HEIGHT: 200,
} as const;

/**
 * Layout dimensions
 */
export const LAYOUT = {
  /** Header height in pixels */
  HEADER_HEIGHT: 80,

  /** Footer height in pixels */
  FOOTER_HEIGHT: 60,

  /** Total fixed height (header + footer) for viewport calculations */
  FIXED_HEIGHT: 140,

  /** Container horizontal padding in pixels (px-4 on each side: 24px * 2) */
  CONTAINER_PADDING: 48,

  /** Left padding for table container in pixels (pl-6: 24px) */
  TABLE_LEFT_PADDING: 24,

  /** Maximum table width as ratio of viewport width (60% of available space) */
  TABLE_MAX_WIDTH_RATIO: 0.6,
} as const;
