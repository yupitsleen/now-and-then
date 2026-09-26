import { memo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import type { Site } from "../../types";
import { useTileConfig } from "../../hooks/useTileConfig";
import { useTheme } from "../../contexts/ThemeContext";
import "leaflet/dist/leaflet.css";

// ponytail: shifted east from GAZA_CENTER to reduce sea; zoom 8.5 fits full strip
const MINIMAP_CENTER: [number, number] = [31.40, 34.40];
const MINI_MAP_ZOOM = 8.5;
const LIGHT_FILTER = "grayscale(1) brightness(1.05) contrast(0.9)";
const DARK_FILTER = "grayscale(1) invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)";

interface MiniMapProps {
  /** The resolved highlighted site, or null. Passed in already-looked-up so
   *  MiniMap doesn't take a whole array reference that changes every filter tick
   *  (which would defeat the memo below). */
  highlightedSite: Site | null;
}

function InvalidateOnResize(): null {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  return null;
}

function TileFilter({ isDark }: { isDark: boolean }): null {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (pane) pane.style.filter = isDark ? DARK_FILTER : LIGHT_FILTER;
  }, [map, isDark]);
  return null;
}

/**
 * Small, non-interactive overview map showing Gaza with a single marker
 * for the currently highlighted site.
 */
export const MiniMap = memo(function MiniMap({ highlightedSite }: MiniMapProps) {
  const { isDark } = useTheme();
  const tileConfig = useTileConfig({ theme: isDark ? "dark" : "light" });

  return (
    <MapContainer
      center={MINIMAP_CENTER}
      zoom={MINI_MAP_ZOOM}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      boxZoom={false}
      className="h-full w-full"
      style={{ background: isDark ? "#1a1a2e" : "#f0f0f0" }}
    >
      <TileLayer url={tileConfig.url} subdomains={tileConfig.subdomains} />
      <InvalidateOnResize />
      <TileFilter isDark={isDark} />
      {highlightedSite && (
        <CircleMarker
          center={highlightedSite.coordinates}
          radius={4}
          pathOptions={{
            color: "#fff",
            weight: 1,
            fillColor: "#ff1a1a",
            fillOpacity: 1,
          }}
        />
      )}
    </MapContainer>
  );
});
