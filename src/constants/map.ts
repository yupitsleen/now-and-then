/**
 * Map configuration constants
 */

/**
 * Gaza Strip center coordinates [latitude, longitude]
 * Adjusted slightly north to better center the strip in the viewport
 */
export const GAZA_CENTER: [number, number] = [31.42, 34.38] as const;

/**
 * Default zoom level for Gaza Strip view
 * Zoom 10.5 provides balanced full-strip visibility in wide containers
 */
export const DEFAULT_ZOOM = 10.5;

/**
 * Zoom level for satellite detail view of individual sites
 * Zoom 17 ensures consistency across all historical imagery time periods
 * (matched to the oldest imagery's maximum available resolution)
 */
export const SITE_DETAIL_ZOOM = 17;

/**
 * CDN URLs for Leaflet marker icons
 */
export const MARKER_ICON_BASE_URL =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img";

export const MARKER_SHADOW_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png";

/**
 * Marker icon configuration
 */
export const MARKER_CONFIG = {
  // Small dots for default state
  iconSize: [12, 20] as [number, number],
  iconAnchor: [6, 20] as [number, number],
  popupAnchor: [0, -17] as [number, number],
  shadowSize: [20, 20] as [number, number],
  // Regular marker size when selected (not enlarged)
  highlightedIconSize: [25, 41] as [number, number],
  highlightedIconAnchor: [12, 41] as [number, number],
  highlightedPopupAnchor: [1, -34] as [number, number],
} as const;

/**
 * Marker class names for consistent styling
 */
export const MARKER_CLASSNAMES = {
  /** Custom marker icon wrapper class */
  CUSTOM_ICON: "custom-marker-icon",
} as const;

/**
 * Tile layer configurations for different languages
 */
export const TILE_CONFIGS = {
  arabic: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: undefined,
  },
  english: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
  },
} as const;

/**
 * Historical satellite imagery time periods using ESRI Wayback archive
 * Wayback provides access to historical World Imagery basemap releases
 */
export const HISTORICAL_IMAGERY = {
  /** Mid 2014 - July 30, 2014 (default - earliest imagery period shown) */
  JULY_2014: {
    releaseNum: 5232,
    date: "2014-07-30",
    label: "Jul 2014",
    url: "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/5232/{z}/{y}/{x}",
    maxZoom: 17, // Older imagery has lower resolution
  },
  /** Early 2024 - January 18, 2024 (default - earliest 2024 imagery) */
  EARLY_2024: {
    releaseNum: 41468,
    date: "2024-01-18",
    label: "Jan 2024",
    url: "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/41468/{z}/{y}/{x}",
    maxZoom: 18, // Recent imagery, but zoom 18 ensures tile availability
  },
  /**
   * Current - fallback only. At runtime SiteDetailView replaces this with the newest
   * ESRI Wayback release; these values are used only if the Wayback API is unreachable.
   */
  CURRENT: {
    releaseNum: 44000,
    date: "2025-01-15",
    label: "Jan 2025",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
} as const;

export type TimePeriod = "JULY_2014" | "EARLY_2024" | "CURRENT";
