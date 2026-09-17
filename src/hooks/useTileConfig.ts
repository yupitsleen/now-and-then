import { TILE_CONFIGS } from "../constants/map";

interface TileConfigOptions {
  /** When "dark", returns the dark basemap regardless of language. */
  theme?: "light" | "dark";
}

/**
 * Tile configuration for the map. Arabic browsers get OSM Arabic tiles;
 * everyone else gets the CartoDB light basemap. Pass { theme: "dark" } to
 * force the dark basemap — used by MiniMap where the pick is automatic
 * (MapTileLayers still exposes light/dark as a user-toggleable layer).
 */
export const useTileConfig = (options: TileConfigOptions = {}) => {
  if (options.theme === "dark") return TILE_CONFIGS.dark;

  const browserLang = navigator.language || navigator.languages?.[0] || "en";
  const isArabic = browserLang.startsWith("ar");

  return isArabic ? TILE_CONFIGS.arabic : TILE_CONFIGS.english;
};
