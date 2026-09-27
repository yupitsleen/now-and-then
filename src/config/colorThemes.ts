/**
 * Consolidated color constants for the Now & Then application
 * Based on the Palestinian flag theme colors
 *
 * This consolidates colors from:
 * - src/constants/colors.ts (main app colors)
 * - src/components/Button/buttonColors.ts (button-specific colors)
 *
 * Single source of truth for all color values across the application.
 */
export const COLORS = {
  // Palestinian flag colors
  FLAG_RED: '#ed3039',
  FLAG_RED_DARK: '#8b2a30', // Muted for dark mode
  FLAG_RED_HOVER: '#d4202a',

  FLAG_GREEN: '#009639',
  FLAG_GREEN_DARK: '#2d5a38', // Muted for dark mode
  FLAG_GREEN_HOVER: '#007b2f',
  FLAG_GREEN_HOVER_DARK: '#244a2e',

  FLAG_BLACK: '#000000',
  FLAG_WHITE: '#fefefe',
  // Comparison mode: "before" (intact) vs "after" (destroyed)
  COMPARE_BEFORE: '#009639', // green
  COMPARE_AFTER: '#ed3039', // red

  // Grays
  GRAY_LIGHT: '#f5f5f5',
  GRAY_MEDIUM: '#a3a3a3',
  GRAY_DARK: '#404040',
  GRAY_SUBTLE: '#525252',

  // Border colors
  BORDER_DEFAULT_LIGHT: '#404040',
  BORDER_BLACK: '#000000',

  // Button-specific colors (from buttonColors.ts)
  // Muted/subdued colors for active/toggle states
  SUBDUED_GREEN_DARK: '#2d5a38',         // Muted green for active toggle (dark mode)
  SUBDUED_GREEN_DARK_HOVER: '#3a6b48',   // Hover on active (dark mode)
  SUBDUED_GREEN_LIGHT: '#2d5a38',        // Muted green for active toggle (light mode) - darker for better contrast with white text
  SUBDUED_GREEN_LIGHT_HOVER: '#3a6b48',  // Hover on active (light mode)
} as const;

/**
 * @deprecated Use COLORS from config/colorThemes instead
 * Kept for backward compatibility - will be removed in next major version
 */
export const PALESTINIAN_FLAG = {
  GREEN: COLORS.FLAG_GREEN,
  RED: COLORS.FLAG_RED,
  BLACK: COLORS.FLAG_BLACK,
  WHITE: COLORS.FLAG_WHITE,
} as const;

/**
 * @deprecated Use COLORS.SUBDUED_* from config/colorThemes instead
 * Kept for backward compatibility - will be removed in next major version
 */
export const SUBDUED_COLORS = {
  GREEN_DARK: COLORS.SUBDUED_GREEN_DARK,
  GREEN_DARK_HOVER: COLORS.SUBDUED_GREEN_DARK_HOVER,
  GREEN_LIGHT: COLORS.SUBDUED_GREEN_LIGHT,
  GREEN_LIGHT_HOVER: COLORS.SUBDUED_GREEN_LIGHT_HOVER,
} as const;
