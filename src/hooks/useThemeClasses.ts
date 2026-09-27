import { useMemo } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { COLORS } from "../config/colorThemes";

/**
 * Theme-aware CSS class utility hook
 *
 * Provides centralized, type-safe access to theme-conditional classes.
 * Eliminates the need for repeated `isDark ? "..." : "..."` conditionals.
 *
 * @example
 * ```tsx
 * const t = useThemeClasses();
 * return <h1 className={`text-2xl ${t.text.heading}`}>Title</h1>
 * ```
 *
 * @returns Object containing theme-aware CSS classes organized by category
 */
export function useThemeClasses() {
  const { isDark } = useTheme();

  return useMemo(() => ({
    /**
     * Text color classes
     */
    text: {
      /** Primary text - High contrast white/black (same as heading/body) */
      primary: isDark ? "text-white" : "text-black",
      /** Primary heading text (h1, h2) - High contrast white/black */
      heading: isDark ? "text-white" : "text-black",
      /** Secondary heading text (h3, h4) - High contrast white/black */
      subheading: isDark ? "text-white" : "text-black",
      /** Body text - High contrast white/black for readability */
      body: isDark ? "text-white" : "text-black",
      /** Muted/secondary text - Slightly lower contrast */
      muted: isDark ? "text-gray-400" : "text-gray-600",
      /** Subtle/disabled text */
      subtle: isDark ? "text-gray-500" : "text-gray-500",
      /** Caption/small text - High contrast white/black */
      caption: isDark ? "text-white" : "text-black",
      /** Emphasis text (bold, important) - High contrast white/black */
      emphasis: isDark ? "text-white" : "text-black",
    },

    /**
     * Background color classes
     */
    bg: {
      /** Primary background (cards, containers) */
      primary: isDark ? "bg-gray-800" : "bg-white",
      /** Secondary background (nested containers) */
      secondary: isDark ? "bg-gray-700" : "bg-gray-50",
      /** Tertiary background (subtle emphasis) - border-only in light mode, subtle fill in dark mode */
      tertiary: isDark ? "bg-gray-700/50" : "",
      /** Hover state background */
      hover: isDark ? "hover:bg-gray-700" : "hover:bg-gray-100",
      /** Active/selected state */
      active: isDark ? "bg-gray-600" : "bg-gray-200",
      /** Disabled state background */
      disabled: isDark ? "bg-gray-700" : "bg-gray-100",
      /** Panel background (semi-transparent) */
      panel: isDark ? "bg-gray-800/90" : "bg-white/90",
    },

    /**
     * Border color classes
     */
    border: {
      /** Default border color */
      default: isDark ? "border-gray-700" : `border-[${COLORS.BORDER_DEFAULT_LIGHT}]`,
      /** Subtle border */
      subtle: isDark ? "border-gray-600" : "border-gray-300",
      /** Strong/emphasis border */
      strong: isDark ? "border-gray-500" : "border-gray-400",
      /** Black border (consistent across themes) */
      black: `border-[${COLORS.BORDER_BLACK}]`,
      /** Theme-aware border: white in dark mode, black in light mode */
      primary: isDark ? "border-white" : "border-black",
      /** Theme-aware border-2: white in dark mode, black in light mode */
      primary2: isDark ? "border-2 border-white" : "border-2 border-black",
      /** Muted border */
      muted: isDark ? "border-gray-600" : "border-gray-300",
    },

    /**
     * Palestinian flag theme colors (muted in dark mode)
     */
    flag: {
      /** Background colors for Palestinian flag red */
      redBg: isDark ? "bg-[#8b2a30]" : "bg-flag-red",
      /** Background colors for Palestinian flag green */
      greenBg: isDark ? "bg-[#2d5a38]" : "bg-brand",
      /** Hover state for green buttons */
      greenHover: isDark ? "hover:bg-[#244a2e]" : "hover:bg-brand-hover",
    },

    /**
     * Form input classes
     */
    input: {
      /** Base input styling */
      base: isDark
        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400"
        : `bg-white border-[${COLORS.BORDER_BLACK}] text-gray-900 placeholder:text-gray-400`,
      /** Focus state */
      focus: `focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent`,
      /** Number input width */
      number: "w-20",
    },

    /**
     * Icon color classes
     */
    icon: {
      /** Default icon color */
      default: isDark ? "text-gray-300" : "text-gray-400",
      /** Muted icon color */
      muted: isDark ? "text-gray-400" : "text-gray-500",
    },

    /**
     * Card/container classes
     */
    card: {
      /** Card background and border */
      base: isDark
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200",
    },

    /**
     * Table classes
     */
    table: {
      /** Base table styling */
      base: "w-full text-sm text-left",
      /** Table cell padding */
      td: "px-4 py-3",
    },

    /**
     * Layout/container classes
     */
    layout: {
      /** Main app background */
      appBackground: isDark ? "bg-gray-600" : "bg-gray-500",
      /** Loading/fallback text */
      loadingText: isDark ? "text-gray-300" : "text-gray-600",
      /** Modal heading */
      modalHeading: isDark ? "text-gray-100" : "text-black",
      /** Skip to content link focus state */
      skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10002] focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg",
    },

    /**
     * Timeline component classes
     */
    timeline: {
      /** Timeline container - Ultra compact */
      container: `backdrop-blur-sm border ${isDark ? "border-white" : "border-black"} rounded px-2 pt-1.5 pb-1 shadow-lg transition-colors duration-200 ${isDark ? "bg-[#000000]/95" : "bg-white/95"}`,
      /** Current date display */
      currentDate: `text-xs font-semibold text-center flex-1${isDark ? " text-[#fefefe]" : ""}`,
      /** Clear date filter button (visible state) */
      clearFilterVisible: `flex items-center gap-1.5 px-2 py-1 rounded shadow-md hover:shadow-lg transition-all duration-200 text-[10px] font-semibold active:scale-95 border ${isDark ? "border-white" : "border-black"}`,
      /** Clear date filter button (invisible/disabled state) */
      clearFilterInvisible: "invisible",
      /** Speed control select */
      speedSelect: "px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-brand focus:border-brand",
      /** Keyboard hint kbd element */
      kbdKey: "px-0.5 py-0 border rounded text-[10px]",
    },

    /**
     * Tooltip classes (for Wayback and other interactive components)
     */
    tooltip: {
      /** Base tooltip styling with border and shadow */
      base: isDark
        ? "bg-gray-900 text-white border-gray-600"
        : "bg-white text-black border-gray-300",
      /** Tooltip border only */
      border: isDark ? "border-gray-600" : "border-gray-300",
      /** Tooltip text color */
      text: isDark ? "text-white" : "text-black",
    },

    /**
     * Wayback timeline marker classes
     */
    marker: {
      /** Minor release marker (thin gray line) */
      minor: isDark ? "bg-gray-700" : "bg-gray-400",
      /** Major release marker (thicker gray line) */
      major: isDark ? "bg-gray-600" : "bg-gray-300",
      /** Opacity for minor markers */
      minorOpacity: "opacity-50",
      /** Opacity for major markers */
      majorOpacity: "opacity-40",
    },

    /**
     * Additional text utilities for common patterns
     */
    textUtil: {
      /** Subtle text (400 gray) - common for labels */
      subtle: isDark ? "text-gray-400" : "text-gray-600",
      /** Muted text (500 gray) - less emphasized */
      muted: isDark ? "text-gray-500" : "text-gray-600",
      /** Light text (300 gray) - for dark mode emphasis */
      light: isDark ? "text-gray-300" : "text-gray-700",
    },

    /**
     * Container background patterns
     */
    containerBg: {
      /** Semi-transparent container (50% opacity) */
      semiTransparent: isDark ? "bg-black/50" : "bg-white/50",
      /** More opaque container (90% opacity) */
      opaque: isDark ? "bg-black/90" : "bg-white/90",
      /** Fully opaque container */
      solid: isDark ? "bg-black" : "bg-white",
    },

    /**
     * Keyboard shortcut (kbd) styling
     */
    kbd: {
      /** Keyboard key display */
      base: isDark ? "bg-gray-700" : "bg-gray-200",
    },

    /**
     * Statistics accent colors - emphasize numbers in dark mode, neutral in light mode
     */
    stats: {
      /** Red accent for destruction statistics (dark mode only) */
      destructionNumber: isDark ? `text-flag-red` : "text-black",
      /** Green accent for heritage statistics (dark mode only) */
      heritageNumber: isDark ? `text-brand` : "text-black",
      /** Orange accent for cultural institution statistics (dark mode only) */
      culturalNumber: isDark ? "text-orange-600" : "text-black",
      /** Red background gradient for critical sections */
      destructionBg: isDark ? "bg-gradient-to-br from-red-900/30 to-red-900/10" : "",
      /** Red background for destruction cards */
      destructionCardBg: isDark ? "bg-red-900/20" : "",
      /** Orange background for cultural institution cards */
      culturalCardBg: isDark ? "bg-orange-900/20" : "",
    },
  }), [isDark]);
}
